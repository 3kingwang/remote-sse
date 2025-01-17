import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMQTTStore } from "@/lib/store"
import { Badge } from "./ui/badge"

export function VinList() {
  const devices = useMQTTStore((state) => state.devices)
  const updateCurrentDevice = useMQTTStore((state) => state.updateCurrentDevice)
  const currentDevice = useMQTTStore((state) => state.currentDevice)
  const selectedDevice = devices.find((device) => device.sid === currentDevice?.sid)
 
  return (
    <Select
      value={
        selectedDevice && selectedDevice.online ? selectedDevice.sid : devices[0].sid
      }
      onValueChange={(value) => {
        updateCurrentDevice(value)
      }}
    >
      <SelectTrigger className="w-[270px]">
        <SelectValue placeholder="Select a device" />
      </SelectTrigger>
      <SelectContent className="w-[270px]">
        {devices.map(
          (device) =>
            device.online && (
              <SelectItem key={device.sid} value={device.sid}>
                <div className="flex items-center gap-2">
                  <p>{device.vin || device.sid}</p>
                  {device.locked === 'free' ? (
                    <span style={{ color: 'green', fontSize: '20px' }}>●</span>
                  ) : (
                    <Badge>{device.locked}</Badge>
                  )}
                </div>
              </SelectItem>
            )
        )}
      </SelectContent>
    </Select>
  )
}
