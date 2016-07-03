'use strict'
var Response = require('./response')
  , Promise = require('q')
  , safePassword = require('./safePassword')
  , allowedUserProperties = [ 'id', 'firstName', 'lastName', 'loginName', 'role' ]
  , MINIMUM_PASSWORD_LENGTH = 8

module.exports = class UserController {
  constructor(store, tokenSigner){
    this.store = store
    this.tokenSigner = tokenSigner
    this.User = store.Model('user')
    if ( !this.User ) throw 'User Model not defined'
  }

  newUser(req){
    var newUser = req.body
      , passwordErrors = this.validatePassword(newUser.password)
    if ( passwordErrors.length > 0 ) return Promise.when(Response.errors({ password: passwordErrors }))
    var defer = Promise.defer()
      , User = this.User
    safePassword.encrypt(newUser.password, function(encryptedPassword, err){
      if ( err ) return defer.resolve(Response.internalError(err))
      var user = new User({
        loginName: newUser.loginName
      , firstName: newUser.firstName
      , lastName: newUser.lastName
      , epassword: encryptedPassword
      , role: 'user'
      })
      return defer.resolve(user.save(function(saved){
        return saved ? Response.created(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
      }))
    })
    return defer.promise
  }

  loginUser(req){
    var self = this
      , loginName = req.body.loginName
      , password = req.body.password
    return this.User.where({ loginName: loginName }).limit(1).exec(function(user){
       if ( !user ) return userOrPasswordMismatch()
       var defer = Promise.defer()
       safePassword.verify(password, user.epassword, function(valid, err){
         if ( err ) return defer.resolve(Response.internalError())
         return defer.resolve(valid ? self.createToken(user.id, user.role) : userOrPasswordMismatch())
       })
       return defer.promise
    })
  }

  findUsers(){
    return this.User.exec(function(users){
      return Response.ok(users.toJson(allowedUserProperties))
    })
  }

  getUser(req){
    var userId = parseInt(req.params.id)
    return this.User.find(userId).exec().then(function(user){
      return user ? Response.ok(user.toJson(allowedUserProperties)) : noSuchUser()
    })
  }

  updateUser(req){
    var userId = parseInt(req.params.id)
      , changes = req.body
    return this.User.find(userId).exec(function(user){
      if ( user ) {
        user.set(changes)
        return user.save(function(saved){
          return saved ? Response.ok(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
        })
      }
      return noSuchUser()
    })
  }

  deleteUser(req){
    var userId = parseInt(req.params.id)
    return this.User.where({ id: userId }).destroy(function(){
      return Response.ok()
    })
  }

  validatePassword(password){
    var errors = []
    password = String(password).trim()
    if ( password.length < MINIMUM_PASSWORD_LENGTH ) errors.push('password is too short')
    return errors
  }

  createToken(userId, role){
    var defer = Promise.defer()
    process.nextTick(function(){
      var token = JSON.stringify({ userId: userId, role: role })
      defer.resolve(Response.ok({ token: token }))
    })
    return defer.promise
  }

}

function userOrPasswordMismatch(){
  return Response.unauthorized('User or password mismatch')
}

function noSuchUser(){
  return Response.error('Failed', 'no such user')
}
