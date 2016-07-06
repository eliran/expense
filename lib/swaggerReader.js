'use strict'

var yaml = require('js-yaml')
  , fs = require('fs')
  , DEFAULT_PORT = 80

module.exports = function(fileName){
  return new SwaggerJSON(yaml.safeLoad(fs.readFileSync(fileName, 'utf8')))
}

class SwaggerJSON {
  constructor(json){
    this.json = json
    this.paths = convertPaths(json.paths)
    this.hostPort = extractPort(json.host)
  }
}

function extractPort(host){
  if ( typeof host !== 'string' ) return DEFAULT_PORT
  var components = host.split(':')
  if ( components.length < 2 ) return DEFAULT_PORT
  return parseInt(components[1]) || DEFAULT_PORT
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
