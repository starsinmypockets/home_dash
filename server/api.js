const express = require("express");
const bodyParser = require("body-parser")
const app = express()
const cors = require('cors')
const conf = require('dotenv').config()
const passport = require('passport')
const Strategy = require('passport-local').Strategy;
const { Record, getRecordsByInterval, User } = require("./db.js")
const LocalStrategy = require('passport-local').Strategy;
const { SESSION_SECRET } = conf.parsed

app.set("view engine", "pug")

app.use(bodyParser.json())
app.use(cors())

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

    return done(null, user.dataValues)
  } catch(err) {
    return done(err)
  }
}))

passport.serializeUser(async (user, done) => {
  try {
    done(null, user.username);
  } catch(err) {
    done(err)
  }
})

passport.deserializeUser(async (username, done) => {
  try{
    const user = await User.findOne({where: {username: username}})
    done(null, user.dataValues);
  } catch(err) {
    done(err)
  } 
})

app.use(passport.initialize());
app.use(require('express-session')({ secret: SESSION_SECRET, resave: false, saveUninitialized: false, maxAge: 60000 }))
app.use(passport.session());

app.use((req, res, next) => {
  console.log('Session -> ', req.session)
  next()
})

/* Avg by hour for last 24 hours */
app.get("/hourly", async (req, res) => {
  try {
    const user = req.session.passport.user
    const hour = 60 * 60 * 1000
    const intervals = 24
    const records = await getRecordsByInterval(hour, intervals, user)
    res.json(records)
  } catch(e) {
    res.json([])
  }
})

/** avg daily readings for the last week **/
app.get("/daily", async (req, res) => {
  const day = 24 * 60 * 60 * 1000
  const intervals = 7
  const records = await getRecordsByInterval(day, intervals)
  res.json(records)
})

/* avg weekly readings for last month */
app.get("/weekly", async (req, res) => {
  const week = 7 * 24 * 60 * 60 * 1000
  const intervals = 4
  const records = await getRecordsByInterval(week, intervals)
  res.json(records)
})

/* avg monthly readings for last year */
app.get("/monthly", async (req, res) => {
  const month = 7 * 24 * 4 * 60 * 60 * 1000
  const intervals = 12
  const records = await getRecordsByInterval(month, intervals)
  res.json(records)
})

// Create new records
// **NOTE** always use array of records [{...record},...]
app.post("/new", async (req, res) => {
  const Record = Model.Record

  try {
    await Record.bulkCreate(req.body)
    return res.json({ success: true })
  } catch (e) {
    console.error("Failed to create Record", e)
    return req.error("Failed to create Record " + e)
  }
})
  
app.post('/login',  passport.authenticate("local"), (req, res) => {
  console.log('login', req.user)
  res.json({
    username: req.user.username,
    success: true
  })
})
  
app.get('/logout', (req, res) => {
	const result = req.logout()
})

app.get('/profile', (req, res) => {
  require('connect-ensure-login').ensureLoggedIn()
  return res.json({user: req.user})
})

app.listen(8099, () => {
  console.log("Listening on port 8099")
})
