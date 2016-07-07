var helpers = require('../helpers')
  , expect = helpers.expect
  , swaggerReader = require('../../lib/swaggerReader')

describe('Swagger Reader', function(){
  it('can read yaml and return json', function(){
    var doc = swaggerReader(__dirname + '/simple.yml')
    expect(doc.json).to.eql({
      host: 'localhost:1234'
    , swagger: '2.0'
    , basePath: '/basePath'
    , paths: {
        '/path': null
      }
    })
  })

  it('converts path paramters from {name} to :name', function(){
    var doc = swaggerReader(__dirname + '/paths.yml')
    expect(doc.paths).to.have.keys('/users', '/users/:id', '/users/:id1/:id2/:id3')
  })

  it('should return host port', function(){
    var doc = swaggerReader(__dirname + '/simple.yml')
    expect(doc.hostPort).to.equal(1234)
  })

  it('should return paths with prepended by base path', function(){
    var doc = swaggerReader(__dirname + '/simple.yml')
    expect(doc.paths).to.have.keys('/basePath/path')
  })
})