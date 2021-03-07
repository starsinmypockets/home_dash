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

  // test info
  const info = {
    sensors: [
      {
        type: "THERM-1a",
        name: "Kitchen sensor-1",
        units: "Degrees Celcius",
        value: 22
      },
      {
        type: "THERM-1a",
        name: "Bathroom sens",
        units: "Degrees Celcius",
        value: 24
      },
      {
        type: "SMOKE",
        name: "Kitchen Smoke Detector",
        units: "Bool",
        value: false
      },
      {
        type: "Contact",
        name: "Front Door Closed",
        units: "Bool",
        value: true
      }
    ]
  }

  res.render("dash.pug", { ...info })
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
