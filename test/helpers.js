var chai = require('chai')
  , OpenRecord = require('openrecord')
  , Promise = require('q')
  , store = new OpenRecord({
      type: 'sqlite3'
    , file: ''
    , migrations: __dirname + '/../migrations/*.js'
    , models: __dirname + '/../lib/models/*.js'
    })

chai.use(require('chai-as-promised'))
chai.use(require('chai-shallow-deep-equal'))

store.clearDatabase = function(){
  return Promise.when(store.Model('user').deleteAll(), store.Model('expense').deleteAll())
}

module.exports = {
  API_TEST_PORT: 9999
, API_TEST_URL: 'http://localhost:9999'
, Router: require('../lib/router')
, Response: require('../lib/response')
, Promise: Promise
, expect: chai.expect
, swaggerReader: require('../lib/swaggerReader')
, store: store
}
