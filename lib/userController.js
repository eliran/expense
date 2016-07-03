'use strict'
var Response = require('./response')
  , Promise = require('q')
  , safePassword = require('./safePassword')
  , allowedUserProperties = [ 'id', 'firstName', 'lastName', 'loginName', 'role' ]
  , MINIMUM_PASSWORD_LENGTH = 8

module.exports = class UserController {
  constructor(store, sessionController){
    this.store = store
    this.sessionController = sessionController
    this.User = store.Model('user')
    if ( !this.User ) throw 'User Model not defined'
  }

  newUser(req){
    var User = this.User
      , newUser = req.body
      , passwordErrors = this.validatePassword(newUser.password)

    if ( passwordErrors.length > 0 ) return Promise.when(Response.errors({ password: passwordErrors }))
    return safePassword.pencrypt(newUser.password).then(function(encryptedPassword){
      var user = new User({
        loginName: newUser.loginName
      , firstName: newUser.firstName
      , lastName: newUser.lastName
      , epassword: encryptedPassword
      , role: 'user'
      })
      return user.save(function(saved){
        return saved ? Response.created(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
      })
    }, function(err){
      return Response.internalError(err)
    })
  }

  loginUser(req){
    var self = this
      , loginName = req.body.loginName
      , password = req.body.password
    return this.User.where({ loginName: loginName }).limit(1).exec(function(user){
       if ( !user ) return userOrPasswordMismatch()
       return safePassword.pverify(password, user.epassword).then(function(valid){
         return valid ? self.createSession(user.id, user.role) : userOrPasswordMismatch()
       }, function(err){
         return Response.internalError(err)
       })
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

  createSession(userId, role){
    return this.sessionController.create({ userId: userId, role: role }).then(function(token){
      return Response.ok({ token: token })
    }, function(err){
      return Response.internalError(err)
    })
  }

}

function userOrPasswordMismatch(){
  return Response.unauthorized('User or password mismatch')
}

function noSuchUser(){
  return Response.error('Failed', 'no such user')
}
