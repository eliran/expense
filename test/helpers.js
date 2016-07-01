var chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

module.exports = {
  API_TEST_PORT: 9999
, API_TEST_URL: 'http://localhost:9999'
, Router: require('../lib/router')
, Response: require('../lib/response')
, Promise: require('q')
, expect : chai.expect
}
