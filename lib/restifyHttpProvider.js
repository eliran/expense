'use strict'
var restify = require('restify')

module.exports = class RestifyHttpProvider {
  constructor(){
    this.server = restify.createServer()
    this.exposeMethods(this.server, [ 'get', 'post', 'put', 'del' ])
  }

  listen(port, ready){
    return this.server.listen(port, ready)
  }

  close(){
    return this.server.close()
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
