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
        return processResponse(fn.apply(object, [ request ]))
      } catch (err){
        return processResponse(Response.internalError(err))
      }

      function processResponse(response){
        if ( response && typeof response.then === 'function' ) {
          return response.then(processResponse, function(err){
            return sendResponse(Response.internalError(err))
          })
        }
        return sendResponse(typeof response === 'object' ? response : Response.internalError('invalid service response'))
      }

      function sendResponse(response){
        res.send(response.status , response.body )
        return next()
      }
    }
  }
}
