'use strict'

module.exports = class MockHttpProvider {
  constructor(){
    this.routes = {}
    this.addVerbs(['get', 'post', 'put', 'del'])
  }

  addVerbs(verbs){
    verbs.forEach(function(verb){
      this.addVerb(verb)
    }, this)
  }

  addVerb(verb){
    var self = this 
    this[verb] = function(path, fn){
      self.routes[verb + ':' + path] = fn
    }
  } 
}
