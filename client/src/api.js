import axios from 'axios'

const fetchSeriesData = (basePath, dashMode, setSeriesData, chartView, setChartView, setIsLoading) => {
  axios.get(`${basePath}/${dashMode}`, { mode: 'no-cors' })
  .then(res => {
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
          [reading.type]: reading.avgValue.toFixed(2),
        })
      })
    })

    console.log('api 1', chartData)

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
    
    console.log('api 2', joined)
    setSeriesData(joined)
    setIsLoading(false)
  }).catch(err => {
    console.log("Error fetching data", err)
  })
}

const fetchCurrentData = (basePath, setCurrentData) => {
  axios.get(`${basePath}/current`, { mode: 'no-cors' })
  .then(res => {
    const data = res.data
    const currentData = []
    
    data.forEach(row => {
      if (!currentData[row.name]) currentData[row.name] = []
      currentData[row.name].push({[row.type]: row.value})
    })
    
    const joined = {}
    Object.keys(currentData).forEach(key => {
      joined[key] = Object.assign({}, ...currentData[key])
    })
    
    console.log('Current data', joined)
    setCurrentData(joined)
  })
}

export { fetchSeriesData, fetchCurrentData }
