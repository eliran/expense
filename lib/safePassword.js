var bcrypt = require('bcrypt')
  , Promise = require('q')

module.exports = {}

module.exports.encrypt = function(password, callback){
  bcrypt.genSalt(10, function(err, salt){
    return err ? callback(err, null) : bcrypt.hash(password, salt, callback)
  })
}

module.exports.verify = function(password, encryptedPassword, callback){
  return bcrypt.compare(password, encryptedPassword, callback)
}

module.exports.pencrypt = function(password){
  return Promise.nfcall(module.exports.encrypt, password)
}

module.exports.pverify = function(password, encryptedPassword){
  return Promise.nfcall(module.exports.verify, password, encryptedPassword)
}
