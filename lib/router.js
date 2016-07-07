'use strict'
var Response = require('./response')

module.exports = class Router {
  constructor(httpProvider, sessionController){
    if ( typeof httpProvider !== 'object' ) throw 'Http Provider is required'
    this._sessionController = sessionController
    this.httpProvider = httpProvider
    this.routes = {}
  }

  setSessionController(sessionController){
    this._sessionController = sessionController
  }

  sessionController(){
    return this._sessionController
  }

  addRoutes(paths, object){
    var self = this
    Object.keys(paths).forEach(function(path){
      var pathObject = paths[path]
      Object.keys(pathObject).forEach(function(verb){
        var pathDef = pathObject[verb]
          , method = pathDef.operationId
        if ( typeof method === 'string' ) {
          self.addRoute(verb, path, object, method)
          if ( pathDef.security ) self.protectRoute(verb, path)
        }
      })
    })
  }

  addRoute(verb, path, object, targetMethod){
    var key = routeKey(verb, path)
      , fn = this.createInvoker(object, targetMethod, key)
    if ( verb === 'delete' ) verb = 'del'
    if ( typeof this.httpProvider[verb] !== 'function' ) throw 'Http Provider doesn\'t support \'' + verb + '\' method'
    this.httpProvider[verb](path, fn)
    this.routes[key] = {
      invoker: fn
    , protected: false
    }
    return fn
  }

  protectRoute(verb, path){
    var route = this.routes[routeKey(verb, path)]
    if ( !route ) throw 'Unknown route'
    route.protected = true
  }

  isProtected(verb, path){
    var route = this.routes[routeKey(verb, path)]
    return route && route.protected
  }

  createInvoker(object, targetMethod, routeKey){
    var router = this
    if ( typeof targetMethod !== 'string' ) throw 'Target method must be a string'
    if ( typeof object !== 'object' ) throw 'Invoker must have an object reference'
    if ( Array.isArray(object) ) {
      for ( var i = 0; i < object.length; ++i ){
        if ( typeof object[i][targetMethod] === 'function' ) {
          object = object[i]
          break
        }
      }
    }
    return function(request, res, next){
      var route = routeKey && router.routes[routeKey]
      if ( !route || !route.protected ) return invoke()

      var sessionController = router._sessionController
      if ( !sessionController || typeof sessionController.verify !== 'function' ) return sendResponse(Response.unauthorized())

      return sessionController.verify(request['session-token']).then(function(state){
        request.session = state
        return invoke()
      }, function(){
        return sendResponse(Response.unauthorized())
      }).catch(function(err){
        return sendResponse(Response.internalError(err))
      })

      function invoke(){
        var fn = object[targetMethod]
        if ( typeof fn !== 'function' ) throw 'No method \'' + targetMethod + '\' in object'
        try {
          return processResponse(fn.apply(object, [ request ]))
        } catch (err){
          return processResponse(Response.internalError(err))
        }
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

function routeKey(verb, path){
  return verb + ':' + path
}
