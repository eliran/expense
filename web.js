'use strict'
var express = require('express')
  , fs = require('fs')

module.exports = class WebService {
  constructor(options){
    options = options || {}
    this.app = express()
    this.configurateStaticDirectories()
  }

  start(port, ready){
    if ( typeof port === 'function' ) {
      ready = port
      port = undefined
    }
    port = port || 80
    this.app.listen(port, function(){
       console.log('Web server start on port ' + port)
       if ( typeof ready === 'function' ) ready()
    })
  }

  setViewEngine(){
    this.app.set('views', './views')
    this.app.set('view engine','pug')
  }

  configurateStaticDirectories(){
    this.app.use(express.static('public'))
  }

  getBowerComponentsPath(){
    var basePath = __dirname + '/bower_components/'
    return fs.readdirSync(basePath).map(function(dirName){
      var fullPath = basePath + dirName
        , stat = null
      try { stat = fs.statSync(fullPath + '/dist') } catch(ok) {}
      if ( stat !== null && stat.isDirectory() ) return fullPath + '/dist'
      return fullPath
    })
  }

  setupPugTemplates(basePath, template){
    this.app.get(basePath + 'views/:pageName', function (req, res) {
      console.log('Render pageName: ', req.params.pageName)
      res.render((req.params.pageName || 'index') + '.jade', {})
    })
    this.app.get(basePath, function(req, res){
      console.log('Render index')
      res.render('index.jade', {}) 
    })
  }

  close(){
  }
}
