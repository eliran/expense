'use strict'
var OpenRecord = require('openrecord')
  , fs = require('fs')
  , path = require('path')

module.exports = class DataStore {
  constructor(config, env){
    this.config = DataStore.getConfig(config, env || process.env.NODE_ENV)
    this.store = null
  }

  ready(callback){
    var store = this.getStore()
    return store.ready(function(){
      callback(null, store)
    })
  }

  setLogging(loggingObject){
    this.logging = loggingObject
  }

  getStore(){
    if ( !this.store ) {
      if ( this.logging ) this.config.logger = this.logging
      this.store = new OpenRecord(this.config)
    }
    return this.store
  }

  static getConfig(config, env){
    var configPath = __dirname
    if ( !env ) env = 'development'
    if ( typeof config === 'string' ) {
      configPath = expendPath(config)
      config = this.readConfigFile(configPath)
      configPath = path.dirname(configPath)
    }
    if ( typeof config !== 'object' ) config = {}
    return DataStore.parseConfig(config, env, process.env, configPath)
  }

  static readConfigFile(configPath){
    return JSON.parse(fs.readFileSync(expendPath(configPath), 'utf8'))
  }

  static parseConfig(config, env, dictionaryObject, configPath){
    if ( !env || !(env in config) ) env = 'default'
    var activeConfig = config[env]
      , $common = config['$common']
    if ( !activeConfig ) return $common || {}
    return addConfig(addConfig({}, $common), activeConfig)

    function addConfig(current, newConfig){
      if ( newConfig ) Object.keys(newConfig).forEach(function(key){
        var configValue = newConfig[key]
        if ( key.startsWith('$$') ) {
          current[key.substring(2)] = expendPath(configValue, configPath || __dirname)
        }
        else if ( key.startsWith('$') ) {
          current[key.substring(1)] = dictionaryObject[configValue]
        }
        else current[key] = configValue
      })
      return current
    }
   
  }
}

function expendPath(pathValue, basePath){
  if ( !path.isAbsolute(pathValue) ) return path.join(basePath || __dirname, pathValue)
  return pathValue
}

