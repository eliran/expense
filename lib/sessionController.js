'use strict'
var Promise = require('q')
  , jwt = require('jsonwebtoken')

module.exports = class SessionControlller {
  constructor(secret){
    this.secret = secret
    if ( typeof secret !== 'string' ) throw 'Session Controller requires a secret key'
    this.roles = {}
  }

  create(state){
    return Promise.nfcall(jwt.sign, state, this.secret, {})
  }

  verify(token){
    return Promise.nfcall(jwt.verify, token, this.secret)
  }

  operationAllowed(operation, session){
    var role = 'user'
    if ( typeof session === 'object' && typeof session.role === 'string' ) role = session.role 
    var operations = this.roles[role]
    if ( !operations ) return false
    return operations[operation]
  }

  setAllowOperationForRole(role, operation, allowed){
    if ( !(role in this.roles) ) this.roles[role] = {}
    this.roles[role][operation] = allowed || false
  }

  allowOperationForRole(role, operation){
    this.setAllowOperationForRole(role, operation, true)
  }

  disallowOperationForRole(role, operation){
    this.setAllowOperationForRole(role, operation, false)
  }
}
