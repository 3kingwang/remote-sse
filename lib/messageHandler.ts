import { useMQTTStore } from "./store"

export interface BufferMessage {
  type: "Buffer"
  data: number[] // 字节数组
}
export function handleMessage(topic: string, message: BufferMessage) {
  if (topic.startsWith("VinList/")) {
    const sid = topic.split("/")[1]
    console.log(`Received vinlist message from ${sid},${decodeMessage(message as BufferMessage)}`)
    useMQTTStore.getState().addDevice(sid)

  }
  if (topic.includes('doip')){
    console.log(`Received doip message from ${topic},${decodeBinMessage(message).toString('hex')}`)
  }
}

export function decodeMessage(message: BufferMessage) {
  return new TextDecoder().decode(new Uint8Array(message.data),)
}

export function decodeBinMessage(message: BufferMessage) {
    return Buffer.from(message.data)
}
