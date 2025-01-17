import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMQTTStore } from '@/lib/store'
import { Badge } from './ui/badge'
import { useEffect, useState } from 'react'

export function VinList() {
  const devices = useMQTTStore((state) => state.devices)
  const updateCurrentDevice = useMQTTStore((state) => state.updateCurrentDevice)
  const currentDevice = useMQTTStore((state) => state.currentDevice)
  const [value, setValue] = useState(currentDevice?.sid ?? undefined)
  useEffect(() => {
    setValue(currentDevice?.sid ?? devices[0]?.sid)
  }, [currentDevice]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Select
      value={value}
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
