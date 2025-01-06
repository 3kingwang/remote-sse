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

const LiveMessages = () => {
  const [, setError] = useState<string | null>(null) // For handling errors
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
    </div>
  )
}

export default LiveMessages
