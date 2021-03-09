const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require('cors')
const { Record } = require("./db.js")
const { Op } = require("sequelize");

app.use(cors())
app.set("view engine", "pug")

app.use(bodyParser.json())

app.get("/test", (req, res) => {
  res.json({ message: "Hello world" })
})

app.get("/", (req, res) => {
  // TODO fetch info from db
  res.send("Hello world")
})

/** Returns records from the last hour in 10 minutes increments **/
app.get("/hourly", async (req, res) => {
  // TODO -- from db.js:
  const now = new Date().getTime()
  const records = await Record.findAll({
    where: {
      recorded: {
        [Op.gte]: now - 3600000
      }
    }
  })
  res.json(records)
})


/** Return avg hourly readings for the last 24 hours **/
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
