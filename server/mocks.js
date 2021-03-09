/**
 * Insert mocked data via sequelize
 * for testing and UI development
 **/

const conf = require('dotenv').config()
const Sequelize = require("sequelize")
const { DB_NAME, DB_USER, DB_PASSWORD } = conf.parsed
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: "localhost",
  dialect: "mysql"
})

const Model = Sequelize.Model

class Record extends Model {}
Record.init(
  {
    // the sensor type -- eg: "temperature sensor"
    // TODO should be fk to a sensor model
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // sensor instance name, eg: "Kitchen smoke detector"
    name: {
      type: Sequelize.STRING,
    },
    // Units
    units: {
      type: Sequelize.STRING
    },
    // sensor value
    // TODO handle units, typed values will be much more useful
    value: {
      type: Sequelize.STRING
    },
    created: {
      type: Sequelize.STRING
    }
  },
  {
    sequelize,
    modelName: "data"
  }
)


function randomNumber(min, max) {  
  return Math.round(Math.random() * (max - min) + min); 
}

const names = ["Office", "Living Room", "Bedroom"]
const types = ["PM1", "PM2.5", "PM10", "temp", "humidity"]
const units = ["PM1", "PM2.5", "PM10", "F", "percent"]
const ranges = [[0,6], [0,10], [0,5], [60,80], [40,80]]
const numRecords = 60 * 24 * 6 // 90 days * 24 hours * 6 readings per hour
const secondsInterval = 600 // 10 minutes * 60 seconds
const now = new Date().getTime() // Current timestamp
const records = []

Record.sync().then(() => {
  names.forEach((name) => {
    types.forEach((type, i) => {
      for (j = 0; j < numRecords; j++) {
        records.push({
          type: type,
          name: name,
          units: units[i],
          value: randomNumber(ranges[i][0],ranges[i][1]),
          created: now - (secondsInterval * j)
        })
      }
    })
  })
  Record.bulkCreate(records)
})
