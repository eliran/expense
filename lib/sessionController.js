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
    if ( typeof session !== 'object' ) return false
    var role = session.role
    if ( typeof role !== 'string' ) return false
    var operations = this.roles[role]
    return operations && operations[operation]
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
