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
/*    var defer = Promise.defer()
    jwt.sign(state, this.secret, {}, function(err, token){
      if ( err ) return defer.reject(err)
      return defer.resolve(token)
    })
    return defer.promise*/
  }

  verify(token){ // jshint ignore: line
    return Promise.nfcall(jwt.verify, token, this.secret)
/*    var defer = Promise.defer()
    jwt.verify(token, this.secret, function(err, state){
      if ( err ) return defer
    })
    return defer.promise*/
  }
}
