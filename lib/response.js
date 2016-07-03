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

  static created(body){
    return new Response(201, body || {})
  }

  static ok(body){
    var emptyBody = !body || (typeof body === 'string' && body.length === 0)
    if ( emptyBody ) return new Response(204, {})
    return new Response(200, body)
  }

  static unauthorized(msg){
    return new Response(403, errorMessage('Unauthorized', msg || 'Unauthorized'))
  }

  static internalError(msg){
    return new Response(500, errorMessage('InternalError', msg || 'Internal Error'))
  }

  static errors(errors){
    return new Response(400, { code: 'Errors', errors: errors })
  }

  static error(code, message){
    return new Response(400, errorMessage(code, message))
  }
}

function errorMessage(code, message){
  return {
    code: code
  , message: message
  }
}
