import { create } from "zustand"
import { publishMessage } from "./messageHandler"

export type Device = {
  sid: string
  vin?: string
  locked?: string
  online?: boolean
}
type State = {
  currentSid: string
  devices: Device[]
  ECUList: string[]
}
type Actions = {
  updateDevice: (device: Device) => void
  updateCurrentSid: (sid: string) => void
  updateECUList: (ecu: string) => void
}

export const useMQTTStore = create<State & Actions>()((set) => ({
  currentSid: "",
  devices: [],
  ECUList: ["e400"],
  updateDevice: (device: Device) =>
    set((state) => {
      const deviceIndex = state.devices.findIndex((d) => d.sid === device.sid)
      if (deviceIndex === -1) {
        return { devices: [...state.devices, device] }
      } else {
        const newDevice = { ...state.devices[deviceIndex], ...device }
        const newDevices = [...state.devices]
        newDevices[deviceIndex] = newDevice
        return { devices: newDevices }
      }
    }),
  updateCurrentSid: (sid: string) =>
    set((state) => {
      const preDeviceId = state.devices.findIndex(
        (d) => d.sid === state.currentSid
      )
      if (preDeviceId !== -1) {
        const preDevice = state.devices[preDeviceId]
        const topic = `VinList/${preDevice.sid}/locked`
        setTimeout(async () => {
          try {
            // 发布消息
            await publishMessage(topic, "free", "", true)
            console.log("Message successfully published to topic:", topic)
          } catch (error) {
            console.error("Error while publishing message:", error)
          }
        }, 0)
      }
      const deviceIndex = state.devices.findIndex((d) => d.sid === sid)
      if (deviceIndex !== -1) {
        const currentDevice = state.devices[deviceIndex]
        if (currentDevice.online && currentDevice.locked === "free") {
          const topic = `VinList/${currentDevice.sid}/locked`
          setTimeout(async () => {
            try {
              // 发布消息
              await publishMessage(topic, "", "locked", true)
              console.log("Message successfully published to topic:", topic)
            } catch (error) {
              console.error("Error while publishing message:", error)
            }
          }, 0)
        }
      }
      return { currentSid: sid }
    }),
  updateECUList: (ecu: string) =>
    set((state) => {
      return { ECUList: [...state.ECUList, ecu] }
    }),
}))
