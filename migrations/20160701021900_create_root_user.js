var safePassword = require('../lib/safePassword')

module.exports = function(){
  this.seed(function(store, done){
    var User = store.Model('user');
    safePassword.pencrypt('adminPassword').then(function(encryptedPassword){
      return User.create({
        loginName: 'admin@root.org'
      , firstName: 'admin'
      , lastName: 'root'
      , role: 'admin'
      , epassword: encryptedPassword
      }).then(function(){
         done()
      })
    })
  })
}
