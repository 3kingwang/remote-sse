import { useMQTTStore } from "./store"

export interface BufferMessage {
  type: "Buffer"
  data: number[]
}
export function handleMessage(topic: string, message: BufferMessage) {
  if (topic.startsWith("VinList/")) {
    const sid = topic.split("/")[1]
    const messageType = topic.split("/")[2]
    if (
      messageType === "online" &&
      decodeMessage(message).toString() !== "\0" &&
      decodeMessage(message).toString() !== "offline"
    ) {
      useMQTTStore.getState().updateDevice({
        sid,
        vin: decodeMessage(message).toString().split(",")[0],
        online: true,
      })
    }
    if (
      messageType === "online" &&
      (decodeMessage(message).toString() === "offline" ||
      decodeMessage(message).toString() === "\0")
    ) {
      useMQTTStore.getState().updateDevice({
        sid,
        online: false,
        locked: "free",
      })
    }
    if (messageType === "locked") {
      useMQTTStore.getState().updateDevice({
        sid,
        locked: decodeMessage(message).toString(),
      })
      useMQTTStore.getState().updateCurrentDeviceStatus({
        sid,
        locked: decodeMessage(message).toString(),
      })
    }
  }
  if (topic.startsWith("V/")) {
    const sid = topic.split("/")[1]
    if (decodeBinMessage(message).toString("hex").slice(8, 12) === "7e00") {
      const ecu = decodeBinMessage(message).toString("hex").slice(0, 4)
      if (sid === useMQTTStore.getState().currentDevice?.sid) {
        useMQTTStore.getState().updateECUList(ecu)
      }
    }
    if(topic.split('/').includes('cyclic')){
      if(sid === useMQTTStore.getState().currentDevice?.sid){
        const decodedMessage = decodeBinMessage(message).toString('hex')
        const ecu = decodedMessage.slice(0, 4)
        const did = decodedMessage.slice(10, 14)
        const value = decodedMessage.slice(14)
        const timestamp = new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        })
        useMQTTStore.getState().updateLiveData(ecu,did,value,timestamp)
      }
    }
  }
}

export function decodeMessage(message: BufferMessage) {
  return new TextDecoder().decode(new Uint8Array(message.data))
}

export function decodeBinMessage(message: BufferMessage) {
  return Buffer.from(message.data)
}

export const publishMessage = async (
  topic: string,
  message?: string,
  type?: string,
  retain: boolean = false
) => {
  try {
    console.log(topic, message, type, retain)
    const response = await fetch("/api/mqtt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, message, type, retain }),
    })

    if (response.ok) {
      console.log("Message published successfully")
    } else {
      console.error("Failed to publish message")
    }
  } catch (error) {
    console.error("Error publishing message:", error)
  }
}
