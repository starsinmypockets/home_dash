const express = require("express");
const bodyParser = require("body-parser")
const app = express()
const cors = require('cors')
const conf = require('dotenv').config()
const uuid = require('uuid').v4
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const passport = require('passport')
const Strategy = require('passport-local').Strategy;
const { Record, getRecordsByInterval, getCurrentValues, User } = require("./db.js")
const LocalStrategy = require('passport-local').Strategy;
const { SESSION_SECRET } = conf.parsed

app.use(bodyParser.json())
app.use(cors())
app.use(session({
  secret: SESSION_SECRET,
  genid: (req) => {
    console.log('Inside the session middleware')
    console.log(req.session)
    return uuid() // use UUIDs for session IDs
  },
  resave: false,
  saveUninitialized: true,
  store: new FileStore
}))

app.use(passport.initialize())
app.use(passport.session())	

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ where: {username: username  }})
    const validPassword = await user.validPassword(password)
    
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    if (!validPassword) {
      return done(null, false, { message: 'Incorrect password.' });
    }
		
    return done(null, user)
  } catch(err) {
    return done(err)
  }
}))

passport.serializeUser(function(user, done) {
  console.log('SERIALIZE', user.dataValues.username)
  try {
    done(null, user.dataValues.username);
  } catch(err) {
    done(err)
  }
})

passport.deserializeUser(async (username, done) => {
  console.log('DESERIALIZE', username)
  try{
    const user = await User.findOne({where: {username: username}})
		done(null, user.dataValues);
  } catch(err) {
    done(err)
  } 
})

app.use((req, res, next) => {
  console.log('Session -> ', req.session)
  console.log('User -> ', req.user)
  next()
})

app.get('/api', async (req, res) =>{
  console.log(req.sessionID)
  res.json({})
})

// TODO DELETE THIS PATH
app.get('/api/authrequired', (req, res) => {
  console.log('Inside GET /authrequired callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n')
  } else {
    res.redirect('/')
  }
})

/* Avg by hour for last 24 hours */
app.get("/api/hourly", async (req, res) => {
  if (req.isAuthenticated()) {
    const hour = 60 * 60 * 1000
    const intervals = 24
    const records = await getRecordsByInterval(hour, intervals)
    console.log('api2', records)
    res.json(records)
  } else {
    res.json([])
  }
})

/** avg daily readings for the last week **/
app.get("/api/daily", passport.authenticate('session'), async (req, res) => {
  if (req.isAuthenticated()) {
    const day = 24 * 60 * 60 * 1000
    const intervals = 7
    const records = await getRecordsByInterval(day, intervals)
    res.json(records)
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})

/* avg weekly readings for last month */
app.get("/api/weekly", async (req, res) => {
  if (req.isAuthenticated()) {
    const week = 7 * 24 * 60 * 60 * 1000
    const intervals = 4
    const records = await getRecordsByInterval(week, intervals)
    res.json(records)
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})

/* avg monthly readings for last year */
app.get("/api/monthly", async (req, res) => {
  if (req.isAuthenticated()) {
    const month = 7 * 24 * 4 * 60 * 60 * 1000
    const intervals = 12
    const records = await getRecordsByInterval(month, intervals)
    res.json(records)
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})

app.get("/api/current", async (req, res) => {
  if (req.isAuthenticated()) {
    console.log('Current authenticated')
    const curVals = await getCurrentValues()
    res.json(curVals)
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})

// Create new records
// **NOTE** always use array of records [{...record},...]
// TODO need to figure out auth for device
app.post("/api/new", async (req, res) => {
  if (req.isAuthenticated()) {
    const Record = Model.Record

    try {
      await Record.bulkCreate(req.body)
      return res.json({ success: true })
    } catch (e) {
      console.error("Failed to create Record", e)
      return req.error("Failed to create Record " + e)
    }
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})
  
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log(user)
    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
    console.log(`req.user: ${JSON.stringify(req.user)}`)
    req.login(user, (err) => {
      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
      console.log(`req.user: ${JSON.stringify(req.user)}`)
      return res.json({});
    })
  })(req, res, next);
})
  
app.get('/api/logout', (req, res) => {
	const result = req.logout()
  return res.json({loggedOut: result})
})

app.get('/api/profile', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({user: req.user})
  } else {
    console.log('NOT AUTHENTICATED')
    res.json([])
  }
})

app.listen(8099, () => {
  console.log("Listening on port 8099")
})
