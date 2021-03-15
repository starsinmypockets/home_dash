const conf = require('dotenv').config()
const Sequelize = require("sequelize")
const { Op, fn, col} = require("sequelize")


console.log('NODE_ENV ----->', process.env.NODE_ENV)

let sequelize

if (process.env.NODE_ENV === 'test') {
  console.log('Connecting to TESTING database...')
  require('mysql2/node_modules/iconv-lite').encodingExists('cesus8')
  const { DB_NAME, DB_USER, DB_PASSWORD } = conf.parsed
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: "localhost",
    dialect: "mysql",
    logging: false
  })
} else {
  console.log('Connecting to PRODUCTION database...')
  const { DB_NAME_TEST, DB_USER_TEST, DB_PASSWORD_TEST } = conf.parsed
  sequelize = new Sequelize(DB_NAME_TEST, DB_USER_TEST, DB_PASSWORD_TEST, {
    host: "localhost",
    dialect: "mysql"
  })
}

const bcrypt = require('bcrypt')
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

const getRecordsByInterval = async (interval, numIntervals, userId) => {
  const allRecords = []
  const iters = new Array(numIntervals)
  const qs = []
  
  for (i = 0; i < numIntervals; i++) {
    const curTime = new Date().getTime() - (interval * i)
    qs.push(Record.findAll({
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
        },
        userId: userId
      },
    }))
  }
  
  return(Promise.all(qs))
}

class User extends Model{
  async validPassword(plaintext) {
    try {
      const result = await bcrypt.compare(plaintext, this.dataValues.password)
      return result
    } catch(e) {
      console.log('Error validating password', e)
      return false
    }
  }
}

User.hashPassword = async (plaintext) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(plaintext, salt)
  return hash
}

User.init(
  {
    username: {
      type: Sequelize.STRING(24),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
  },
  {
    sequelize,
    modelName: "user"
  }
)

const getCurrentValues = async (userId) => {
    const cats = await Record.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('type')), 'type'],
        'name'
      ],
    }).map(result => result.dataValues)
    
    const qs = []
   
    for (i = 0; i < cats.length; i++) {
      const cat = cats[i]
      qs.push(Record.findAll({
        where: {
          type: cat.type,
          name: cat.name,
          userId: userId
        },
        order: [
          ['id', 'DESC']
        ],
        limit: 1
      }).then(result => result[0]))
    }

    return Promise.all(qs)
}


/** Relationships **/
User.hasMany(Record)
Record.belongsTo(User)

// make it so
Record.sync()
User.sync()

module.exports = { Record, getRecordsByInterval, getCurrentValues, User }
