var bcrypt = require('bcrypt')

module.exports = {
  encrypt: function(password, callback){ // jshint ignore: line
    bcrypt.genSalt(10, function(err, salt){
      if ( err ) callback(null, err)
      bcrypt.hash(password, salt, function(err, hash){
        return callback(err ? null : hash, err)
      })
    })
  }
, verify: function(password, encryptedPassword, callback){
    bcrypt.compare(password, encryptedPassword, function(err, matching){
      if ( err ) return callback(false, err)
      return callback(matching, null)
    })
  }
}
