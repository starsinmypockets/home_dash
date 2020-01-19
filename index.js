const express = require("express")
const app = express()
const Model = require('db.js')

app.get("/", (req, res) => {
  res.json({ message: "Hello world" })
})

app.listen(8099, () => {
  console.log("Listening on port 8099")
})
