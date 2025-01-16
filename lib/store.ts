import { create } from 'zustand'
import { publishMessage } from './messageHandler'
import { decodeDid, getEcuName } from './utils'
import { Device, DidValueProps, ECU, PublishPayloadProps } from '@/types'
import { DefaultPublishPayload } from '@/constants/DefaultPayload'

type State = {
  currentUser: string
  currentDevice: Device | null
  devices: Device[]
  ECUList: ECU[]
  publishPayload: PublishPayloadProps
  liveData: DidValueProps[]
}

type Actions = {
  updateDevice: (device: Device) => void
  updateCurrentDevice: (sid: string) => void
  updateECUList: (ecu: string) => void
  updateCurrentUser: (user: string) => void
  updateCurrentDeviceStatus: (device: Device) => void
  updateLiveData: (
    ecu: string,
    did: string,
    value: string,
    timestamp: string
  ) => void
}

export const useMQTTStore = create<State & Actions>()((set) => ({
  currentUser:
    (typeof window !== 'undefined' && localStorage.getItem('username')) || '',
  currentDevice: null,
  devices: [],
  ECUList: [{ address: 'e400', name: getEcuName('e400') }],
  publishPayload: DefaultPublishPayload,
  liveData: [],
  updateDevice: (device: Device) =>
    set((state) => {
      const deviceIndex = state.devices.findIndex((d) => d.sid === device.sid)
      if (deviceIndex === -1) {
        return { devices: [...state.devices, device] }
      } else {
        const newDevice = { ...state.devices[deviceIndex], ...device }
        let newDevices = [...state.devices]
        if (newDevice.online === false) {
          newDevices = state.devices.filter((d) => d.sid !== newDevice.sid)
          return { devices: newDevices }
        }
        newDevices[deviceIndex] = newDevice
        return { devices: newDevices }
      }
    }),
  updateCurrentDevice: (sid: string) =>
    set((state) => {
      const preDeviceId = state.devices.findIndex(
        (d) => d.sid === state.currentDevice?.sid
      )
      if (preDeviceId !== -1) {
        const preDevice = state.devices[preDeviceId]
        if (preDevice.locked === state.currentUser) {
          const topic = `VinList/${preDevice.sid}/locked`
          setTimeout(async () => {
            try {
              // 发布消息
              await publishMessage(topic, 'free', '', true)
              console.log('Message successfully published to topic:', topic)
            } catch (error) {
              console.error('Error while publishing message:', error)
            }
          }, 0)
        }
      }
      const deviceIndex = state.devices.findIndex((d) => d.sid === sid)
      if (deviceIndex !== -1) {
        const currentDevice = state.devices[deviceIndex]
        if (currentDevice.online && currentDevice.locked === 'free') {
          const topic = `VinList/${currentDevice.sid}/locked`
          setTimeout(async () => {
            try {
              // 发布消息
              await publishMessage(topic, '', 'locked', true)
              console.log('Message successfully published to topic:', topic)
              currentDevice.locked = state.currentUser
            } catch (error) {
              console.error('Error while publishing message:', error)
            }
          }, 0)
        }
      }
      return { currentDevice: state.devices.find((d) => d.sid === sid) || null }
    }),
  updateECUList: (ecu: string) =>
    set((state) => {
      const ecuIndex = state.ECUList.findIndex((e) => e.address === ecu)
      if (ecuIndex !== -1) {
        return { ECUList: state.ECUList }
      }
      return {
        ECUList: [...state.ECUList, { address: ecu, name: getEcuName(ecu) }],
      }
    }),
  updateCurrentUser: (user: string) =>
    set(() => {
      return { currentUser: user }
    }),
  updateCurrentDeviceStatus: (device: Device) =>
    set((state) => {
      if (state.currentDevice?.sid === device.sid) {
        if (device.online === false) {
          return { currentDevice: null }
        }
        return { currentDevice: { ...state.currentDevice, ...device } }
      } else {
        return { currentDevice: state.currentDevice }
      }
    }),
  updateLiveData: (
    ecu: string,
    did: string,
    value: string,
    timestamp: string
  ) =>
    set((state) => {
      const newLiveData = [...state.liveData]
      const ecuDidIndex = newLiveData.findIndex(
        (e) => e.ecu === ecu && e.did === did
      )

      if (ecuDidIndex === -1) {
        newLiveData.push({ ecu, did, data: [{ raw: value,parsed: decodeDid(did, value), timestamp }] })
      } else {
        const item = newLiveData[ecuDidIndex]
        if (item.data.length >50) item.data.shift()
        item.data.push({ raw: value, parsed: decodeDid(did, value), timestamp })
      }

      return { liveData: newLiveData }
    }),
}))
