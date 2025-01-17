import { DidValueProps } from '@/types'
import ReactEcharts from 'echarts-for-react'
import { useEffect, useState } from 'react'

const LiveChart = function ({ dataItem }: { dataItem: DidValueProps }) {
  const [options, setOptions] = useState({
    title: {
      text: `${dataItem.ecu}-${dataItem.did}`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: dataItem.data.map((item) => item.timestamp),
      axisLabel: {
        fontSize: 8,
        interval: 5,
        rotate: 45, // Rotate to avoid overlap
        overflow: 'truncate',
        formatter: function (value: string) {
          // Customize label formatting
          return value.slice(0, 10) // Show only the first 10 characters of the timestamp
        },
      },

      axisLine: {
        show: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 8,
        margin: 8,
        interval: 0,
        formatter: function (value: number) {
          // Customize label formatting if needed
          return value.toLocaleString()
      }},
      axisLine: {
        show: true,
      },
      axisTick: {
        show: true,
      },
      splitLine: {
        show: true,
      },
      min: Math.min(...(dataItem.data.map((item) => item.parsed) as number[])),
      max: Math.max(...(dataItem.data.map((item) => item.parsed) as number[])),
      splitNumber: 5, // Number of ticks on the Y-axis
    },
    series: [
      {
        name: 'Value',
        sampling: 'lttb', // Data reduction technique
        data: dataItem.data.map((item) => item.parsed),
        type: 'line',
        lineStyle: {
          width: 2,
          color: '#8884d8',
        },
        showSymbol: false, // Hide the data points
        animation: false, // Disable animation for better performance
      },
    ],
    renderer: 'webgl', // Use WebGL for rendering
    dataZoom: [
      {
        type: 'inside', // Enabling internal zoom
        start: 0,
        end: 100,
      },
      {
        type: 'slider', // Enabling external zoom control
        show: true,
        bottom: 10,
        height: 20,
        start: 0,
        end: 100,
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: {},
        dataView: {},
      },
      left: 'right',
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedMin = Math.min(
        ...(dataItem.data.map((item) => item.parsed) as number[])
      )
      const updatedMax = Math.max(
        ...(dataItem.data.map((item) => item.parsed) as number[])
      )

      const updatedOptions = {
        ...options,
        xAxis: {
          ...options.xAxis,
          data: dataItem.data.map((item) => item.timestamp),
          interval: Math.floor(dataItem.data.length / 10),
        },
        yAxis: {
          ...options.yAxis,
          min: updatedMin, // Dynamically update min value
          max: updatedMax, // Dynamically update max value
        },
        series: [
          {
            ...options.series[0],
            data: dataItem.data.map((item) => item.parsed),
          },
        ],
      }
      setOptions(updatedOptions)
    }, 1) // Adjust this value as needed for your data update frequency

    return () => clearInterval(interval) // Cleanup on component unmount
  }, [dataItem, options])

  return (
    <div className="flex flex-col gap-2 mr-2">
      <ReactEcharts
        option={options} // Pass the updated chart options to the component
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}

export default LiveChart
