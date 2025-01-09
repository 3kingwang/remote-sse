import { ECUInfo } from "@/constants/EcuInfo"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEcuName(ecu: string){
  return ECUInfo.find(ECU=> ECU.address === ecu)?.ecuName || "Unknown"
}