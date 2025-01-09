"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn, getEcuName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMQTTStore } from "@/lib/store"
import { Badge } from "./ui/badge"
import { DeviceActions } from "./DeviceActions"

export function EcuList() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const ecuList = useMQTTStore((state) => state.ECUList)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[180px] justify-between"
          >
            {value ? (
              <div className="flex items-center gap-6">
                <p>{value}</p>
                <Badge variant="outline">{getEcuName(value)}</Badge>
              </div>
            ) : (
              "Select a ecu..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {ecuList.map((ecu) => (
                  <CommandItem
                    key={ecu.address}
                    value={ecu.address}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ecu.address ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-6">
                      <p>{ecu.address}</p>
                      <Badge variant="outline">{ecu.name}</Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DeviceActions />
    </div>
  )
}
