require('dotenv').config()

const express = require("express")
const app = express()
const Model = require("./db.js")
const winston = require("winston")

app.set('view engine', 'pug')

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

  res.render("dash.pug", {...info} )
})

app.post("/new", (req, res) => {})

app.listen(8099, () => {
  console.log("Listening on port 8099")
})
