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
      , sessionController = this.sessionController
      , passwordErrors = this.validatePassword(newUser.password)
    if ( passwordErrors.length > 0 ) return Promise.when(Response.errors({ password: passwordErrors }))
    newUser.role = newUser.role || 'user'
    var roleErrors = this.validateRole(newUser.role)
    if ( roleErrors.length > 0 ) return Promise.when(Response.errors({ role: roleErrors }))
    return safePassword.pencrypt(newUser.password).then(function(encryptedPassword){
      return User.where({ loginName: newUser.loginName }).limit(1).exec().then(function(user){
        if ( user ) return Response.error('AlreadyExists', 'Login name in use')
        user = new User({
          loginName: newUser.loginName
        , firstName: newUser.firstName
        , lastName: newUser.lastName
        , epassword: encryptedPassword
        , role: sessionController.operationAllowed('setRole', req.session) ? newUser.role : 'user'
        })
        return user.save(function(saved){
          return saved ? Response.created(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
        })
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
         return valid ? self.createSession(user) : userOrPasswordMismatch()
       }, function(err){
         return Response.internalError(err)
       })
    })
  }

  findUsers(req){
    if ( !this.manageUsersAllowed(req) ) return Promise.resolve(Response.unauthorized())
    var query = this.User
    if ( req && req.query ) {
      var limit = parseInt(req.query.limit)
        , offset = parseInt(req.query.offset)
      if ( limit ) query = query.limit(limit)
      if ( offset) query = query.offset(offset)
    }
    return query.exec(function(users){
      return Response.ok(users.toJson(allowedUserProperties))
    })
  }

  manageUsersAllowed(req){
    return this.sessionController.operationAllowed('manageUsers', this.requestSession(req))
  }

  getUser(req){
    if ( !this.manageUsersAllowed(req) ) return Promise.resolve(Response.unauthorized())
    var userId = parseInt(req.params.id)
    return this.User.find(userId).exec().then(function(user){
      return user ? Response.ok(user.toJson(allowedUserProperties)) : noSuchUser()
    })
  }

  updateUser(req){
    var session = this.requestSession(req)
      , userId = parseInt(req.params.id)
      , sessionUserId = parseInt(session.userId)
      , changes = req.body
    if ( sessionUserId !== userId && !this.manageUsersAllowed(req) ) return Promise.resolve(Response.unauthorized())
    if ( changes.loginName ) return Promise.resolve(Response.error('NotAllowed', 'Changing loginName is not allowed'))
    if ( changes.epassword ) return Promise.resolve(Response.unauthorized())
    if ( changes.role ) {
      if ( this.validateRole(changes.role).length > 0 ) return Promise.resolve(unknownRole())
      if ( !this.sessionController.operationAllowed('setRole', req.session) ) delete changes.role
    }
    if ( changes.newPassword ) return this.changeUserPassword(req)
    return this.User.find(userId).exec(function(user){
      if ( !user ) return noSuchUser()
      user.set(changes)
      return user.save(function(saved){
        return saved ? Response.ok(user.toJson(allowedUserProperties)) : Response.errors(user.errors)
      })
    })
  }

  requestSession(req){
    if ( !req ) return {}
    return req.session || {}
  }

  changeUserPassword(req){
    var userId = parseInt(req.params.id)
      , currentPassword = req.body.password
      , newPassword = req.body.newPassword
    if ( !req || !req.session ) return Promise.resolve(Response.unauthorized())
    var adminRole = req.session.role === 'admin'
    return this.User.find(userId).exec(function(user){
      if ( !user ) return noSuchUser()
      if ( adminRole ) return updatePassword(user, newPassword)
      return safePassword.pverify(currentPassword, user.epassword).then(function(valid){
        if ( !valid ) return userOrPasswordMismatch()
        return updatePassword(user, newPassword)
      })
    })

    function updatePassword(user, newPassword){
      return safePassword.pencrypt(newPassword).then(function(encryptedPassword){
        user.set({ epassword: encryptedPassword })
        return user.save(function(saved){
          return saved ? Response.ok() : Response.internalError('cannot save user')
        })
      })
    }
  }

  deleteUser(req){
    if ( !this.manageUsersAllowed(req) ) return Promise.resolve(Response.unauthorized())
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

  validateRole(role){
    if ( this.sessionController.hasRole(role) ) return []
    return [ 'unknown role' ]
  }

  createSession(user){
    return this.sessionController.create({ userId: user.id, role: user.role }).then(function(token){
      return Response.ok({
        token: token
      , id: user.id
      , loginName: user.loginName
      , firstName: user.firstName
      , lastName: user.lastName
      , role: user.role
      })
    }, function(err){
      return Response.internalError(err)
    })
  }

}

function userOrPasswordMismatch(){
  return Response.unauthorized('User or password mismatch')
}

function unknownRole(){
  return Response.error('UnknownRole', 'Unknown role')
}

function noSuchUser(){
  return Response.error('Failed', 'no such user')
}
