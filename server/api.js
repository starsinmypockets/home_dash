const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require('cors')
const { Record, getRecordsByInterval } = require("./db.js")

app.use(cors())
app.set("view engine", "pug")

app.use(bodyParser.json())

app.get("/test", (req, res) => {
  res.json({ message: "Hello world" })
})

/* Avg by hour for last 24 hours */
app.get("/hourly", async (req, res) => {
  const hour = 60 * 60 * 1000
  const intervals = 24
  const records = await getRecordsByInterval(hour, intervals)
  res.json(records)
})


/** avg daily readings for the last week **/
app.get("/daily", async (req, res) => {
  const day = 24 * 60 * 60 * 1000
  const intervals = 7
  const records = await getRecordsByInterval(day, intervals)
  res.json(records)
})

/* avg weekly readings for last month */
app.get("/weekly", async (req, res) => {
  const week = 7 * 24 * 60 * 60 * 1000
  const intervals = 4
  const records = await getRecordsByInterval(week, intervals)
  res.json(records)
})

/* avg monthly readings for last year */
app.get("/monthly", async (req, res) => {
  const month = 7 * 24 * 4 * 60 * 60 * 1000
  const intervals = 12
  const records = await getRecordsByInterval(month, intervals)
  res.json(records)
})

// Create new records
// **NOTE** always use array of records [{...record},...]
app.post("/new", async (req, res) => {
  const Record = Model.Record

  try {
    console.log(req.body)
    await Record.bulkCreate(req.body)
    return res.json({ success: true })
  } catch (e) {
    console.error("Failed to create Record", e)
    return req.error("Failed to create Record " + e)
  }
})

app.listen(8099, () => {
  console.log("Listening on port 8099")
})
