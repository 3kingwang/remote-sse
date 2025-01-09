import { useMQTTStore } from "@/lib/store"

export function LiveData() {
    const liveData = useMQTTStore((state) => state.liveData)
    return(
        <div>
            {JSON.stringify(liveData)}
        </div>
    )
}