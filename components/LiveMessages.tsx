'use client'

import React, { useEffect, useState } from 'react'
import { handleMessage } from '@/lib/messageHandler'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Label } from './ui/label'
import { VinList } from './VinList'
import { EcuList } from './EcuList'
import { LiveData } from './LiveData'
import { toast } from 'sonner'

const LiveMessages = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5 // 最大重连次数

  useEffect(() => {
    let eventSource: EventSource | null = null

    const connectToServer = () => {
      // 确保关闭旧的连接
      if (eventSource) {
        eventSource.close()
      }

      eventSource = new EventSource('/api/mqtt')

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data && data.topic && data.message) {
            handleMessage(data.topic, data.message)
            setLoading(false) // 数据成功接收，停止加载状态
            setError(null) // 清除错误状态
            setRetryCount(0) // 重置重连计数器
          }
        } catch (err) {
          setError('Failed to process incoming message.')
          console.error('Error parsing SSE message:', err)
        }
      })

      eventSource.addEventListener('error', () => {
        if (eventSource?.readyState === EventSource.CLOSED) {
          setError('Connection closed by server.')
        } else {
          setError('Error in receiving SSE.')
        }

        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            connectToServer()
          }, 3000) // 3秒后重新连接
        } else {
          setError(`Failed to connect after ${maxRetries} attempts.`)
          if (eventSource) {
            eventSource.close() // 确保关闭连接
          }
        }
      })
    }

    // 初始化连接
    connectToServer()

    // Cleanup the connection when the component is unmounted
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [retryCount]) // 将 retryCount 添加为依赖项

  return (
    <div>
      {loading && <div>Loading live data...</div>}
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
