const conf = require('dotenv').config()
const { PW_SALT_ROUNDS } = conf
const bcrypt = require('bcrypt')
const saltRounds = 10

const getSalt = async (plaintext) => {
  const salt = await bcrypt.genSalt(PW_SALT_ROUNDS)
  const hash = await bcrypt.hash(plaintext, salt)
  console.log(hash)
}

getSalt(process.argv[2])
