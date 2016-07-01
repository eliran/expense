'use strict'
var Response = require('./response')

module.exports = class Router {
  constructor(httpProvider){
    if ( typeof httpProvider !== 'object' ) throw 'Http Provider is required'
    this.httpProvider = httpProvider
    this.routes = {}
  }

  addRoutes(paths, object){
    var self = this
    Object.keys(paths).forEach(function(path){
      var pathObject = paths[path]
      Object.keys(pathObject).forEach(function(verb){
        var method = pathObject[verb].operationId
        if ( typeof method === 'string' ) {
          self.addRoute(verb, path, object, method)
        }
      })
    })
  }

  addRoute(verb, path, object, targetMethod){
    var fn = this.createInvoker(object, targetMethod)
    if ( verb === 'delete' ) verb = 'del'
    if ( typeof this.httpProvider[verb] !== 'function' ) throw 'Http Provider doesn\'t support \'' + verb + '\' method'
    this.httpProvider[verb](path, fn)
    return fn
  }

  createInvoker(object, targetMethod){
    if ( typeof targetMethod !== 'string' ) throw 'Target method must be a string'
    if ( typeof object !== 'object' ) throw 'Invoker must have an object reference'
    return function(request, res, next){
      var fn = object[targetMethod]
      if ( typeof fn !== 'function' ) throw 'No method \'' + targetMethod + '\' in object'
      try {
        var responseOrPromise = fn.apply(object, [ request ])
        if ( responseOrPromise && typeof responseOrPromise.then === 'function' ) {
          return responseOrPromise.then(processResponse, function(err){
            processResponse(Response.internalError(err.message))
          })
        }
        return processResponse(responseOrPromise)
      } catch (err){
        return processResponse(Response.internalError(err.message))
      }

      function validateResponse(responseObject){
        if ( typeof responseObject !== 'object' ) return Response.internalError('invalid service response')
        return responseObject
      }

      function processResponse(responseObject){
        responseObject = validateResponse(responseObject)
        res.send(responseObject.status , responseObject.body )
        return next()
      }
    }
  }
}
