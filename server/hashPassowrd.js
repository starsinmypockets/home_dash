const bcrypt = require('bcrypt')
const saltRounds = 10
const myPlaintextPassword = process.argv[2]

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
			console.log(hash)
    })
})
