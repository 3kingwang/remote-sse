import {create} from 'zustand'

type Device = {
    sid: string,
    vin: string,
    locked: string,
}
type State = {
    currentDevice: Device | null,
    devices: Device[] | [],
   
}
type Actions = {
  addDevice: (device: Device) => void
}

export const useMQTTStore = create<State&Actions>()((set) => ({
  currentDevice: null,
  devices: [],
  addDevice: (device: Device) =>
    set((state) => ({
      devices: state.devices ? [...state.devices, device] : [device],
    })),
}))