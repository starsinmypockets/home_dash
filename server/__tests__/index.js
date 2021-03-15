const { app } = require('../api')
const session = require('supertest-session')

let testSession = null
let authenticatedSession = null

beforeEach(() => {
  process.env.NODE_ENV = 'test'
  testSession = session(app)
})

describe("Init", () => {
  test("it should be true", () => {
    expect(true).toEqual(true)
  })

  test("it should fetch", async () => {
    const res = await testSession.get('/test')
    expect(res.body).toEqual({"hello": "world"})
  })
})

describe("User authentication and data fetching", () => {
  test("User should not login successfully", async () => {
    const payload = {
      username: 'test1',
      password: 'wrongpw'
    }
    const res = await testSession.post('/api/login').send(payload)
    expect(res.body).toEqual({"authenticated": false})
  })

  test("User should login successfully", async () => {
    const payload = {
      username: 'test1',
      password: 'xvnhhh123!'
    }
    const res = await testSession.post('/api/login').send(payload)
    expect(res.body).toEqual({"authenticated": true})
  })

})

describe("Unauthenticated session",  () => {
  test("Unlogged user should NOT be able to access data", async () => {
    const res = await testSession.get('/api/hourly')
    expect(res.body.length).toEqual(0)
  })
})

describe("Authenticated session", () => {
  beforeEach(async done => {
    const payload = {
      username: 'test1',
      password: 'xvnhhh123!'
    }

    testSession.post('/api/login')
      .send(payload)
      .end(function (err) {
        if (err) return done(err)
        authenticatedSession = testSession
        return done()
      })
  })

  test("Logged in user should be able to access data", async done => {
    const res = await authenticatedSession.get('/api/hourly')
    expect(res.body.length).toBeGreaterThan(0)
    done()
  })
})
