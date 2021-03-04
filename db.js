const conf = require('dotenv').config()
const Sequelize = require("sequelize")

console.log(conf)
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
    }
  },
  {
    sequelize,
    modelName: "data"
  }
)

Record.sync({ force: true }).then(() => {
  return Record.create({
    name: "Sensor 1",
    type: "temp",
    units: "degrees celsius",
    value: "125"
  })
})

module.exports = { Record }
