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

  getStore(){
    if ( !this.store ) {
      this.store = new OpenRecord(this.config)
    }
    return this.store
  }

  static getConfig(config, env){
    if ( !env ) env = 'development'
    if ( typeof config === 'string' ) config = this.readConfigFile(config)
    if ( typeof config !== 'object' ) config = {}
    return DataStore.parseConfig(config, env, process.env)
  }

  static readConfigFile(configPath){
    if ( !path.isAbsolute(configPath) ) configPath = path.join(__dirname, configPath)
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  static parseConfig(config, env, dictionaryObject){
    if ( !env || !(env in config) ) env = 'default'
    var activeConfig = config[env]
      , $common = config['$common']
    if ( !activeConfig ) return $common || {}
    return addConfig(addConfig({}, $common), activeConfig)

    function addConfig(current, newConfig){
      if ( newConfig ) Object.keys(newConfig).forEach(function(key){
        var configValue = newConfig[key]
        if ( key.startsWith('$') ) {
          current[key.substring(1)] = dictionaryObject[configValue]
        }
        else current[key] = configValue
      })
      return current
    }
  }
}
