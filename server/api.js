const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const Model = require("./db.js")

app.set("view engine", "pug")

app.use(bodyParser.json())

app.get("/test", (req, res) => {
  res.json({ message: "Hello world" })
})

app.get("/", (req, res) => {
  // TODO fetch info from db
  res.send("Hello world")
})

app.get("/hourly", async (req, res) => {
  // TODO -- from db.js:
  res.json([
    // each array represents a sensor / name combination
      {
        name: "Office",
        sensor: "PM2.5",
        units: "PM2.5",
        readings: [
          {
            time: 1614891600,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1614978000,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1615064400,// timestamp of period beginning
            value: 4 // average for period
          },
          {
            time: 1615150800,// timestamp of period beginning
            value: 4 // average for period
          },
          {
            time: 1615237200,// timestamp of period beginning
            value: 3 // average for period
          },
          {
            time: 1615323600,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1615410000,// timestamp of period beginning
            value: 1 // average for period
          },
          {
            time: 1615496400,// timestamp of period beginning
            value: 5 // average for period
          },
          {
            time: 1615582800,// timestamp of period beginning
            value: 2// average for period
          },
          {
            time: 1615669200,// timestamp of period beginning
            value: 2// average for period
          },
          {
            time: 1615755600,// timestamp of period beginning
            value: 6// average for period
          },
          {
            time: 1615842000,// timestamp of period beginning
            value: 5// average for period
          },
        ]
      },
      {
        name: "Kitchen",
        sensor: "PM2.5",
        units: "PM2.5",
        readings: [
          {
            time: 1614891600,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1614978000,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1615064400,// timestamp of period beginning
            value: 4 // average for period
          },
          {
            time: 1615150800,// timestamp of period beginning
            value: 4 // average for period
          },
          {
            time: 1615237200,// timestamp of period beginning
            value: 3 // average for period
          },
          {
            time: 1615323600,// timestamp of period beginning
            value: 2 // average for period
          },
          {
            time: 1615410000,// timestamp of period beginning
            value: 1 // average for period
          },
          {
            time: 1615496400,// timestamp of period beginning
            value: 5 // average for period
          },
          {
            time: 1615582800,// timestamp of period beginning
            value: 2// average for period
          },
          {
            time: 1615669200,// timestamp of period beginning
            value: 2// average for period
          },
          {
            time: 1615755600,// timestamp of period beginning
            value: 6// average for period
          },
          {
            time: 1615842000,// timestamp of period beginning
            value: 5// average for period
          },
        ]
      }
    ],
  )
})

app.get("/daily", async (req, res) => {
  res.json({
    
  })

})

app.get("/weekly", async (req, res) => {

})

app.get("/monthly", async (req, res) => {

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
