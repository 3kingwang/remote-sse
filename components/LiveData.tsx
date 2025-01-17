import { useMQTTStore } from '@/lib/store'
import LiveChart from './LiveChart'

export function LiveData() {
  const liveData = useMQTTStore((state) => state.liveData)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mt-4 p-6">
      {liveData.map((dataItem) => {
        if (dataItem.data[0].parsed) {
          return (
            <LiveChart key={dataItem.ecu + dataItem.did} dataItem={dataItem} />
          )
        }
      })}
    </div>
  )
}
