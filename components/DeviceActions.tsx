import { PlayIcon, RefreshCcwIcon, Save } from "lucide-react"
import { Button } from "./ui/button"
import { useMQTTStore } from "@/lib/store"
import { publishMessage } from "@/lib/messageHandler"
import { toast } from "sonner"

export function DeviceActions() {
  const currentDevice = useMQTTStore((state) => state.currentDevice)
  const currentUser = useMQTTStore((state) => state.currentUser)
  const publishPayload = useMQTTStore((state) => state.publishPayload)
  const refreshECUList = async () => {
    if (!currentDevice) {
      toast.warning("Please select a device first")
      return
    }
    console.log(currentDevice.locked,currentUser)
    if (
      currentDevice.locked !== "free" &&
      currentDevice.locked !== currentUser
    ) {
      toast.warning("Device is locked by another user")
      return
    }
    if(currentDevice.locked === 'free'){
      const topic = `VinList/${currentDevice.sid}/locked`
      await publishMessage(topic, "", "locked", true)
    }
    const topic = `T/${currentDevice.sid}`
    const message = "e4003e00"
    await publishMessage(topic, message, "doip")
  }
  const startLiveData = async () => {
    console.log('start live data')
    if (!currentDevice) {
      toast.warning("Please select a device first")
      return
    }
    if (
      currentDevice.locked !== "free" &&
      currentDevice.locked !== currentUser
    ) {
      toast.warning("Device is locked by another user")
      return
    }
    const topic = `T/${currentDevice.sid}/config`
    await publishMessage(topic, JSON.stringify(publishPayload), "")
  }
  return (
    <div>
      <Button variant="ghost" onClick={refreshECUList}>
        <RefreshCcwIcon />
      </Button>
      <Button variant="ghost" onClick={startLiveData}>
        <PlayIcon />
      </Button>
      <Button variant="ghost">
        <Save />
      </Button>
    </div>
  )
}
