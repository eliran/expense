'use strict'

var yaml = require('js-yaml')
  , fs = require('fs')

module.exports = function(fileName){
  return new SwaggerJSON(yaml.safeLoad(fs.readFileSync(fileName, 'utf8')))
}

class SwaggerJSON {
  constructor(json){
    this.json = json
    this.paths = convertPaths(json.paths)
  }
}

function convertPaths(paths){
  if ( typeof paths !== 'object' ) return {}
  var convertedPath = {}
  Object.keys(paths).forEach(function(path){
    convertedPath[convertPath(path)] = paths[path]
  })
  return convertedPath
}

function convertPath(path){
  return path.replace(/\{[^}]+\}/gi, function(param){
    return ':' + param.substring(1,param.length - 1)
  })
}
