import { useState } from 'react'
import './App.css'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [data, setData] = useState([])
  const [hasFetched, setHasFetched]  = useState(false)

  if (!hasFetched) {
    // just do this once, or when appropriate
    setHasFetched(true)
    axios.get('http://pjwalker.net:8099/hourly', { mode: 'no-cors',
    }).then(res => {
      const chartData = []
      console.log(res.data)
      res.data.forEach((sensor, i) => {
        chartData[i] = []
        sensor.readings.forEach(reading => {
          chartData[i].push({
            name: sensor.name,
            time: new Date(reading.time * 1000).toDateString(),
            value: reading.value,
            foo: "Bar",
            bar: "Baz",
          })
        })
      })
      setData(chartData)
    }).catch(err => {
      console.log("Error fetching data", err)
    })
  }

  console.log("CHART DATA", data)

  return (
    <div className="App">
			<h1>Home Dash</h1>
      <main>
        <h2>PM2.5</h2>
        {data.map(d => {
        return (
          <div>
            <h3>{d[0].name}</h3>
            <LineChart
              width={400}
              height={400}
              style={{margin: "auto"}}
              data={d}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis dataKey="time" />
              <YAxis dataKey="value" />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              <Line type="monotone" dataKey="value" stroke="#ff7300" yAxisId={0} />
            </LineChart>
          </div>
          )
        })}
      </main>
    </div>
  )
}

export default App
