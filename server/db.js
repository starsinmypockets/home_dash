const conf = require('dotenv').config()
const Sequelize = require("sequelize")
const { Op, fn, col} = require("sequelize")

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
    },
    recorded: {
      type: Sequelize.STRING
    },
  },
  {
    sequelize,
    modelName: "data"
  }
)

const getRecordsByInterval = async (interval, numIntervals) => {
  const allRecords = []
  for (i = 0; i < numIntervals; i++) {
    const curTime = new Date().getTime() - (interval * i)
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
          [Op.gte]: curTime - interval,
          [Op.lte]: curTime 
        }
      },
    })

    allRecords.push(records)
  }
  console.log('-----------------------------', allRecords)
  return allRecords
}

Record.sync()

module.exports = { Record, getRecordsByInterval }
