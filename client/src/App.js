import { useState } from 'react'
import DayJS from 'dayjs'
import './App.css'
import Spinner from './Spinner'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [data, setData] = useState([])
  const [hasFetched, setHasFetched]  = useState(false)
  const [dashMode, setDashMode] = useState('Hourly') // Hourly, Daily, Weekly, Monthly
  const [chartDisplay, setChartDisplay] = useState({})
  const [isLoading, setIsLoading] = useState()
  const [chartView, setChartView] = useState({})

  if (!hasFetched) {
    // just do this once, or when appropriate (for ex if we update from hourly to daily)
    setHasFetched(true)
    setIsLoading(true)
    
    // TODO handle hourly / daily / ...
    axios.get(`http://pjwalker.net:8099/${dashMode}`, { mode: 'no-cors',
    }).then(res => {
      const chartData = []

      // sort arrays by name field
      res.data.forEach((hour, i) => {
        hour.forEach(reading => {
          if (!chartData[`${reading.name}`]) {
            chartData[`${reading.name}`] = []
          }
          chartData[`${reading.name}`].push({
            recorded: reading.recorded,
            units: reading.units,
            [reading.type]: reading.avgValue,
          })
        })
      })

      // join rows in 'recorded' field
      const joined = []

      Object.keys(chartData).forEach(key => {
        const dates = {}
        
        chartData[key].forEach(row => {
          dates[row.recorded] = row
        })

        joined[key] = Object.keys(dates).map(date => {
          return Object.assign({}, ...chartData[key].filter(r => r.recorded === date))
        })

        joined[key].sort((row1, row2) => row1.recorded - row2.recorded)
        setChartView(Object.assign(chartView, {[key]: 'PM2.5'})) // default to temp data
      })
      
      setData(joined)
      setIsLoading(false)
      console.log('Chart view', chartView)
    }).catch(err => {
      console.log("Error fetching data", err)
    })
  }

  console.log("CHART DATA", data)
  const getTimeString = timestamp => {
    return DayJS(timestamp * 1).format('MM/DD/YY - HH:mm')
  }

  return (
    <div className="App">
      <main>
			<h1 className="text-4xl">Home Dash</h1>
      <div className="flex w-1/4 mx-auto">
      {['Hourly', 'Weekly', 'Daily', 'Monthly'].map(mode => {
        const disabled = (mode === dashMode) ? 'opacity-50 cursor-not-allowed' : ''
        return(
          <button className={`flex-1 bg-blue-500 text-white font-bold p-2 m-2 rounded ${disabled}`} onClick={e => {
          setHasFetched(false)
          setDashMode(mode)
        }}>
            {mode}
          </button>
        )
      })}
      </div>
      { isLoading && 
        <Spinner />
      }
      { !isLoading &&
      <div>
        {Object.keys(data).map(key => {
        console.log("Item data", data[key])
        
        return (
          <div className="mt-6 border-t-2">
            <h3 className="text-3xl my-4">{key}</h3>
            <i>Current:</i>
            <div className="flex w-2/4 mx-auto my-4">
              <div className="flex-1 bg-gray-400 shadow-md p-4 mx-2 rounded cursor-pointer" onClick={_ => {
                setChartView(Object.assign({}, chartView, {[key]: 'PM2.5'}))
              }}>
                <button className="text-2xl">PM2.5: <span className="text-white">5</span></button>
              </div>
              <div className="flex-1 bg-pink-400 shadow-md p-4 mx-2 rounded cursor-pointer" onClick = {_ => {
                setChartView(Object.assign({}, chartView, {[key]: 'Temp'}))
              }}>
                <button className="text-2xl">Temp: <span className="text-white">74°</span></button>
              </div>
              <div className="flex-1 bg-blue-400 shadow-md p-4 mx-2 rounded cursor-pointer" onClick={_ => {
                  setChartView(Object.assign({}, chartView, {[key]: 'Humidity'}))
              }}>
                <button className="text-2xl">Humidity: <span className="text-white">64%</span></button>
              </div>
            </div>
            <div className="mt-6">
              <i>{dashMode}:</i>
              <LineChart
                width={600}
                height={400}
                style={{margin: "auto"}}
                data={data[key]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis 
                  dataKey={row => getTimeString(row.recorded)}
                  textAnchor="begining" angle={45}
                  tickLine={false} 
                  height={120}
                />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                { (chartView[key] === 'PM2.5') && <Line type="monotone" dataKey="PM1" stroke="purple" yAxisId={0} /> }
                { (chartView[key] === 'PM2.5') && <Line type="monotone" dataKey="PM10" stroke="cyan" yAxisId={0} /> }
                { (chartView[key] === 'PM2.5') && <Line type="monotone" dataKey="PM2.5" stroke="teal" yAxisId={0} /> }
                { (chartView[key] === 'Temp') && <Line type="monotone" dataKey="temp" stroke="purple" yAxisId={0} /> }
                { (chartView[key] === 'Humidity') && <Line type="monotone" dataKey="humidity" stroke="purple" yAxisId={0} /> }
                <Legend />
              </LineChart>
            </div>
          </div>
          )
        })}
        </div>
        }
      </main>
    </div>
  )
}

export default App
