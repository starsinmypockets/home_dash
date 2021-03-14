import { useState } from 'react'
import DayJS from 'dayjs'
import axios from 'axios'
import './App.css'
import Spinner from './Spinner'
import LoginForm from './LoginForm'
import { fetchSeriesData, fetchCurrentData } from './api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const basePath = "http://dev.pjwalker.net/api"

function App() {
  const [seriesData, setSeriesData] = useState([])
  const [currentData, setCurrentData] = useState({})
  const [hasFetched, setHasFetched]  = useState(false)
  const [dashMode, setDashMode] = useState('Daily') // Hourly, Daily, Weekly, Monthly
  const [chartDisplay, setChartDisplay] = useState({})
  const [isLoading, setIsLoading] = useState()
  const [chartView, setChartView] = useState({})
  const [user, setUser] = useState()
  const [showModal, setShowModal] = useState(false)
  
  const loginSubmit = async (username, password) => {
    await axios.post(`${basePath}/login`, {
      username: username,
      password: password
    })
    setHasFetched(false)
  }

  const logoutSubmit = async () => {
    await axios.get(`${basePath}/logout`)
    setHasFetched(false)
  }

  if (!hasFetched) {
    // just do this once, or when appropriate (for ex if we update from hourly to daily)
    setHasFetched(true)
    setIsLoading(true)
    fetchSeriesData(basePath, dashMode, setSeriesData, chartView, setChartView, setIsLoading)
    fetchCurrentData(basePath, setCurrentData)
  }

  const getTimeString = timestamp => {
    return DayJS(timestamp * 1).format('MM/DD/YY - HH:mm')
  }

  const showLogin = Object.keys(seriesData).length === 0

  return (
    <div className="App">
      <main>
			<h1 className="text-4xl">Home Dash</h1>
      <LoginForm 
        showLogin={showLogin}
        loginSubmit={loginSubmit}
        logoutSubmit={logoutSubmit}
      />
      { (!showLogin) && 
        <div className="flex w-1/4 mx-auto">
        {['Hourly', 'Daily', 'Weekly', 'Monthly'].map(mode => {
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
      }
      { isLoading && 
        <Spinner />
      }
      { !isLoading &&
      <div>
        {Object.keys(seriesData).map(key => {
        
        return (
          <div className="mt-6 border-t-2">
            <h3 className="text-3xl my-4">{key}</h3>
            <i>Current:</i>
            <div className="flex w-2/4 mx-auto my-4">
              <div className="flex-1 bg-gray-400 shadow-md p-4 mx-2 rounded cursor-pointer" onClick={_ => {
                setChartView(Object.assign({}, chartView, {[key]: 'PM2.5'}))
              }}>
                <button className="text-2xl">
                  PM2.5: <span className="text-white">
                    {currentData[key]['PM2.5'] | '--'}
                  </span>
                </button>
              </div>
              <div className="flex-1 bg-pink-400 shadow-md p-4 mx-2 rounded cursor-pointer" onClick = {_ => {
                setChartView(Object.assign({}, chartView, {[key]: 'Temp'}))
              }}>
                <button className="text-2xl">
                  Temp: <span className="text-white">
                    {currentData[key]['temp'] | '--'}°
                  </span>
                </button>
              </div>
              <div 
                className="flex-1 bg-blue-400 shadow-md p-4 mx-2 rounded cursor-pointer"
                onClick={_ => {
                  setChartView(Object.assign({}, chartView, {[key]: 'Humidity'}))
                }}
              >
                <button className="text-2xl">
                  Humidity: <span className="text-white">
                    {currentData[key]['humidity'] | '--'}%
                  </span>
                </button>
              </div>
            </div>
            <div className="mt-6">
              <i>{dashMode} Avg.:</i>
              <LineChart
                width={800}
                height={400}
                style={{margin: "auto"}}
                data={seriesData[key]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis 
                  dataKey={row => getTimeString(row.recorded)}
                  textAnchor="begining" angle={45}
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
