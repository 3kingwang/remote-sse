import { NextRequest, NextResponse } from "next/server"
import mqtt from "mqtt"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"

// To store SSE clients and MQTT clients for each user
const clients: { [key: string]: ReadableStreamDefaultController | null } = {} // Store a single client for each user
const mqttClients: { [key: string]: mqtt.MqttClient | null } = {} // Store a single MQTT client per user

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Get session cookie and decrypt it
  const cookie = (await cookies()).get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.username) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.username // Use username as unique identifier

  // Set the headers for SSE
  const headers = new Headers()
  headers.set("Content-Type", "text/event-stream")
  headers.set("Cache-Control", "no-cache")
  headers.set("Connection", "keep-alive")
  headers.set("Access-Control-Allow-Origin", "*")

  // Create a new ReadableStream for SSE
  const readableStream = new ReadableStream<Uint8Array>({
    start(controller) {
      // If this is the first connection for the user, initialize the client's controller
      if (!clients[userId]) {
        clients[userId] = controller
      }

      // Cleanup when the request is closed or finished
      req.signal?.addEventListener("abort", () => {
        // Remove the client's controller when the user disconnects
        clients[userId] = null
        // 主动发布下线消息到 MQTT
        if (mqttClients[userId]) {
          mqttClients[userId]?.publish(
            `ClientList/online/${session?.username}`,
            "no", // 发布用户下线消息
            { retain: true } // 保留消息，确保 MQTT 客户端会接收到
          )
          console.log(`User ${userId} is now offline.`)
        }
        // Clean up MQTT client when the last SSE client disconnects
        if (clients[userId] === null && mqttClients[userId]) {
          mqttClients[userId]?.end() // Close MQTT client connection
          mqttClients[userId] = null // Remove the MQTT client
        }
      })
    },
    cancel() {
      // Cleanup when the stream is canceled (client disconnects)
      // 取消流时，主动发布下线消息到 MQTT
      if (mqttClients[userId]) {
        mqttClients[userId]?.publish(
          `ClientList/online/${session?.username}`,
          "no", // 发布用户下线消息
          { retain: true } // 保留消息，确保 MQTT 客户端会接收到
        )
        console.log(`User ${userId} is now offline.`)
      }
      clients[userId] = null
      if (mqttClients[userId]) {
        mqttClients[userId]?.end() // Close MQTT client connection
        mqttClients[userId] = null
      }
    },
  })

  // Create a NextResponse with the ReadableStream and headers
  const response = new NextResponse(readableStream, { status: 200, headers })

  // Initialize MQTT client for the user if it doesn't exist
  if (!mqttClients[userId]) {
    mqttClients[userId] = mqtt.connect(
      `mqtts://${process.env.NEXT_PUBLIC_MQTT_HOST!}:${process.env
        .NEXT_PUBLIC_MQTT_PORT!}`,
      {
        username: session?.username,
        password: session?.password, // Use an appropriate password or method for authentication
        clean: true,
        keepalive: 30,
        rejectUnauthorized: false,
        will: {
          topic: `ClientList/online/${session?.username}`,
          payload: "no",
          retain: true,
        },
      }
    )

    mqttClients[userId].on("connect", () => {
      console.log(`User ${userId} connected to MQTT broker`)
      mqttClients[userId]?.publish(
        `ClientList/online/${session?.username}`,
        "yes",
        { retain: true }
      )
      mqttClients[userId]?.subscribe("#") // Replace with your topic
    })

    mqttClients[userId].on("message", (topic, message) => {
      // Create a message object to send the topic and message
      const data = {
        topic: topic,
        message: message,
      }

      // Send the received MQTT message along with the topic to the connected client
      if (clients[userId]) {
        const dataString = `data: ${JSON.stringify(data)}\n\n`
        clients[userId]?.enqueue(new TextEncoder().encode(dataString))
      }
    })
  }

  // Return the response (SSE stream)
  return response
}

// Publish MQTT message to a topic
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Get session cookie and decrypt it
  const cookie = (await cookies()).get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.username) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.username // Use username as unique identifier

  // Get message and topic from the request body
  const { message, topic, type, retain } = await req.json()
  let newMessage = message
  if (type === "locked") {
    newMessage = session.username
  }
  if (type === 'doip'){
    newMessage = Buffer.from(message,'hex')
  }


  // If MQTT client for the user exists, publish the message
  if (mqttClients[userId]) {
    try {
      mqttClients[userId]?.publish(topic, newMessage, { retain })

      console.log(`Message published to ${topic}: ${message}`)
      return new NextResponse("Message published successfully", { status: 200 })
    } catch (err) {
      console.error("Failed to publish message:", err)
      return new NextResponse("Failed to publish message", { status: 500 })
    }
  } else {
    console.error("MQTT client not found for user:", userId)
    return new NextResponse("MQTT client not found for user", { status: 404 })
  }
}
