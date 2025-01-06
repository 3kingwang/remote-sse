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
  const updateCurrentSid = useMQTTStore((state) => state.updateCurrentSid)
  return (
    <Select onValueChange={(value) => updateCurrentSid(value)}>
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
                  {device.locked === "free" ? (
                    <span style={{ color: "green", fontSize: "20px" }}>●</span>
                  ) : (
                    <Badge variant="destructive">{device.locked}</Badge>
                  )}
                </div>
              </SelectItem>
            )
        )}
      </SelectContent>
    </Select>
  )
}
