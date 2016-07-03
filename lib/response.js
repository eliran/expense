'use strict'

module.exports = class Response {
  constructor(status, body){
    if ( typeof body === 'undefined' ) {
      body = status
      status = 200
    }
    this.status = status || 200
    this.body = body || {}
  }

  static ok(body){
    var emptyBody = !body || (typeof body === 'string' && body.length === 0)
    if ( emptyBody ) return new Response(204, {})
    return new Response(200, body)
  }

  static internalError(msg){
    return new Response(500, errorMessage('InternalError', msg || 'Internal Error'))
  }
}

function errorMessage(code, message){
  return {
    code: code
  , message: message
  }
}
