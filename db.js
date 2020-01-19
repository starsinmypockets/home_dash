const Sequelize = require("sequelize")

const { DB_NAME, DB_USER, DB_PASS } = process.env
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: "localhost",
  dialect: "mysql"
})

const Model = Sequelize.Model

class Record extends Model {}
Record.init(
  {
    // the sensor type -- eg: "temperature sensor"
    // @@TODO should be fk to a sensor model
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // primary key
    // sensor instance name, eg: "Kitchen smoke detector"
    name: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    // Units
    units: {
      type: Sequlize.STRING
    },
    // sensor value
    // @@TODO handle units, typed values will be much more useful
    value: {
      type: Sequlize.STRING
    }
  },
  {
    sequelize,
    modelName: "record"
  }
)

Record.sync({ force: true }).then(() => {
  return Record.create({
    name: "TEMP-1",
    type: "CHID IP",
    units: "degrees celsius"
  })
})

module.exports = { Record }
