'use client'

import React, { useEffect, useState } from "react"
import { handleMessage } from "@/lib/messageHandler"
import { useMQTTStore } from "@/lib/store"

const LiveMessages = () => {
  const [error, setError] = useState<string | null>(null) // For handling errors
  const devices = useMQTTStore((state) => state.devices)
  useEffect(() => {
    // Create a new EventSource to listen for messages from the server
    const eventSource = new EventSource("/api/mqtt")

    // Listen for incoming messages
    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) // Parse the incoming JSON data

        // Ensure the data has both topic and message
        if (data && data.topic && data.message) {
          // Update the state with the new message
          handleMessage(data.topic, data.message)
        }
      } catch (err) {
        setError("Failed to process incoming message.")
        console.error("Error parsing SSE message:", err)
      }
    })

    // Listen for error events
    eventSource.addEventListener("error", () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection closed by server.")
      } else {
        setError("Error in receiving SSE.")
      }
    })

    // Cleanup the connection when the component is unmounted
    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div>
      <h1>Live MQTT Messages</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>{JSON.stringify(devices)}</div>
    </div>
  )
}

export default LiveMessages
