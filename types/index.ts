export type DoipEcuProps = {
  address: string
  DIDs: string[]
  trigger_DTCs: string[]
  entity: string
}
export type CANProps = {
  speed: number
  enabled: string
}
export type ADCProps = {
  channels: number[]
  sampling_speed: number
}
export type GatewayMorrorProps = {
  platform: string
  value: string
}
export type CANFDProps = {
  arbitration_speed: number
  data_speed: number
}
export type ADCLinuxProps = {
  channels_mapping: number
  sampling_speed: number
}
export type LinProps = {
  speed: number
}

export type PublishPayloadProps = {
  can1: CANProps
  can2: CANProps
  doip_ecus: DoipEcuProps[]
  adc1: ADCProps
  adc2: ADCProps
  adc3: ADCProps
  gateway_mirror: GatewayMorrorProps
  canfd_1: CANFDProps
  canfd_2: CANFDProps
  canfd_3: CANFDProps
  adc: ADCLinuxProps
  lin1: LinProps
  lin2: LinProps
  lin3: LinProps
  lin4: LinProps
}
export type Device = {
  sid: string
  vin?: string
  locked?: string
  online?: boolean
}
export type ECU = {
  address: string
  name: string
}


export type DidValueProps = {
  ecu: string
  did: string
  data: {
    raw: string
    parsed?: number | null
    timestamp: string
  }[]
}
