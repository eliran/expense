'use strict'
var Response = require('./response')
  , Promise = require('q')
  , allowedUserProperties = [ 'id', 'firstName', 'lastName', 'loginName', 'role' ]
  , MINIMUM_PASSWORD_LENGTH = 8

module.exports = class UserController {
  constructor(store){
    this.store = store
    this.User = store.Model('user')
    if ( !this.User ) throw 'User Model not defined'
  }

  newUser(req){
    var newUser = req.body
      , passwordErrors = this.validatePassword(newUser.password)
    if ( passwordErrors.length > 0 ) return Promise.when(Response.errors({ password: passwordErrors }))
    var user = new this.User({
      loginName: newUser.loginName
    , firstName: newUser.firstName
    , lastName: newUser.lastName
    , epassword: this.hashPassword(newUser.password)
    , role: 'user'
    })
    return user.save(function(saved){
      return saved ? Response.created(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
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

  hashPassword(plainPassword){
    return plainPassword
  }

  validatePassword(password){
    var errors = []
    password = String(password).trim()
    if ( password.length < MINIMUM_PASSWORD_LENGTH ) errors.push('password is too short')
    return errors
  }
}

function noSuchUser(){
  return Response.error('Failed', 'no such user')
}
