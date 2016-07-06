var safePassword = require('../lib/safePassword')
module.exports = function(){
  this.seed(function(store, done){
    var User = store.Model('user');
    console.log('Creating a user: ', User)
    safePassword.pencrypt('adminPassword').then(function(encryptedPassword){
      console.log('Password: ', encryptedPassword)
      return User.create({
        loginName: 'admin@root.org'
      , firstName: 'admin'
      , lastName: 'root'
      , role: 'admin'
      , epassword: encryptedPassword
      }).then(function(err){
         console.log('Finished with user: ', err)
         done(err)
      })
    }, function(error){
      console.log('Failed generating password for admin user')
    })
  })
}
