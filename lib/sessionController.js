'use strict'
var Promise = require('q')
  , jwt = require('jsonwebtoken')

module.exports = class SessionControlller {
  constructor(secret){
    this.secret = secret
    if ( typeof secret !== 'string' ) throw 'Session Controller requires a secret key'
  }

  create(state){
    return Promise.nfcall(jwt.sign, state, this.secret, {})
  }

  verify(token){
    return Promise.nfcall(jwt.verify, token, this.secret)
  }
}
