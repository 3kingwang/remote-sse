"use client"

import React, { useEffect, useState } from "react"
import { handleMessage } from "@/lib/messageHandler"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Label } from "./ui/label"
import { VinList } from "./VinList"
import { EcuList } from "./EcuList"
import { LiveData } from "./LiveData"


const LiveMessages = () => {
  const [error, setError] = useState<string | null>(null) // For 
  useEffect(() => {
    
    const connectToServer = () => {
      const eventSource = new EventSource("/api/mqtt")

      eventSource.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data && data.topic && data.message) {
            handleMessage(data.topic, data.message)
          }
        } catch (err) {
          setError("Failed to process incoming message.")
          console.error("Error parsing SSE message:", err)
        }
      })

      eventSource.addEventListener("error", () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          setError("Connection closed by server.")
        } else {
          setError("Error in receiving SSE.")
        }

        // 尝试重新连接
        setTimeout(connectToServer, 3000) // 3秒后重新连接
      })

      return eventSource
    }

    // 初始化连接
    const eventSource = connectToServer()

    // Cleanup the connection when the component is unmounted
    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Online Devices</CardTitle>
          <CardDescription>
            List of devices currently online and available for remote control.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-12">
          <div className="flex flex-col gap-2">
            <Label className="text-medium font-bold">Device List</Label>
            <VinList />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-medium font-bold">ECU List</Label>
            <EcuList />
          </div>
        </CardContent>
      </Card>
      <LiveData />
    </div>
  )
}

export default LiveMessages
