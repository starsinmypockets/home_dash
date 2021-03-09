const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require('cors')
const { Record } = require("./db.js")
const { Op, fn, col} = require("sequelize");

app.use(cors())
app.set("view engine", "pug")

app.use(bodyParser.json())

app.get("/test", (req, res) => {
  res.json({ message: "Hello world" })
})

/* Avg by hour for last 24 hours */
app.get("/hourly", async (req, res) => {
  const response = []
  // get current hour's average values
  for (i = 0; i < 24; i++) {
    const curTime = new Date().getTime() - (3600000 * i)
    const records = await Record.findAll({
      attributes: [
        'name',
        'type',
        'units',
        'recorded',
        [fn('AVG', col('value')), 'avgValue']
      ],
      group: ['name', 'type'],
      where: {
        recorded: {
          [Op.gte]: curTime - 3600000,
          [Op.lte]: curTime 
        }
      }
    })
    response.push(records)
  }
  res.json(response)
})


/** avg daily readings for the last week **/
app.get("/daily", async (req, res) => {
  res.json({
    
  })

})

/* avg weekly readings for last month */
app.get("/weekly", async (req, res) => {

})

/* avg monthly readings for last year */
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
