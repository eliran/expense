'use strict'
var restify = require('restify')

module.exports = class RestifyHttpProvider {
  constructor(logger){
    this.server = restify.createServer({ log: logger })
    this.server.use(restify.CORS())
    this.exposeHeader('X-TOKEN', 'session-token')
    this.server.use(restify.bodyParser({ mapParams: false }))
    this.server.use(restify.queryParser({ mapParams: false }))
    this.exposeMethods(this.server, [ 'get', 'post', 'put', 'del' ])
  }

  listen(port, ready){
    return this.server.listen(port, ready)
  }

  close(){
    return this.server.close()
  }

  exposeHeader(headerName, requestKey){
    this.server.use(function(req, res, next){
      var headerValue = req.header(headerName)
      if ( headerValue ) req[requestKey] = headerValue
      return next()
    })
  }

  exposeMethods(object, methods){
    for (var i = 0; i < methods.length; ++i ){
      this[methods[i]] = this.forwardMethod(object, methods[i])
    }
  }

  forwardMethod(object, method){
    var self = this
    return function(){
      return self.server[method].apply(self.server, arguments)
    }
  }
}