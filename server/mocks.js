const conf = require('dotenv').config()
const Sequelize = require("sequelize")
const { DB_NAME, DB_USER, DB_PASSWORD } = conf.parsed
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: "localhost",
  dialect: "mysql"
})
const {Record, User} = require('./db')

const addUser = async () => {
  const hash = await User.hashPassword('xvnhhh123!')
  console.log('hash----', hash)
  const user = await User.create({
    username: 'test1',
    password: hash
  })
  return user
}

addUser().then(user => {
  function randomNumber(min, max) {  
    return Math.round(Math.random() * (max - min) + min); 
  }

  const names = ["Office", "Living Room", "Bedroom"]
  const types = ["PM1", "PM2.5", "PM10", "temp", "humidity"]
  const units = ["PM1", "PM2.5", "PM10", "F", "percent"]
  const ranges = [[0,6], [0,10], [0,5], [60,80], [40,80]]
  const numRecords = 60 * 24 * 6 // 90 days * 24 hours * 6 readings per hour
  const secondsInterval = 600000 // 10 minutes * 60 seconds * 1000 milis
  const now = new Date().getTime() // Current timestamp
  const records = []

  names.forEach((name) => {
    types.forEach((type, i) => {
      for (j = 0; j < numRecords; j++) {
        records.push({
          type: type,
          name: name,
          units: units[i],
          value: randomNumber(ranges[i][0],ranges[i][1]),
          recorded: now - (secondsInterval * j),
          userId: user.id
        })
      }
    })
  })

  Record.bulkCreate(records)
})
