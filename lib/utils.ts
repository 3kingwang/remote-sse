import { ECUInfo } from "@/constants/EcuInfo"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEcuName(ecu: string){
  return ECUInfo.find(ECU=> ECU.address === ecu)?.ecuName || "Unknown"
}

export function decodeDid(did: string,value: string){
  if (did === 'dd00'){
    return Number((parseInt(value, 16) / 600).toFixed(2))
  }
  if(did === 'dd02'){
    return Number((parseInt(value, 16) / 4).toFixed(2))
  }
  return null
}