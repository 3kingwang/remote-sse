import { useMQTTStore } from '@/lib/store'
import LiveChart from './LiveChart'

export function LiveData() {
  const liveData = useMQTTStore((state) => state.liveData)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2  gap-4 mt-4">
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
