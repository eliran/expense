var helpers = require('../helpers')
  , expect = helpers.expect
  , Router = helpers.Router
  , Response = helpers.Response
  , restify = require('restify')
  , testRoutes = {
      '/resource': { 
        get: { operationId: 'allResources' }
      , post: { operationId: 'newResource' } 
      }
    , '/resource/:id': { 
        get: { operationId: 'getResource' }
      , put: { operationId: 'updateResource' }
      , delete: { operationId: 'deleteResource' } 
      }
    }

describe('restify http provider', function(){
  before(function(done){
    this.client = restify.createJsonClient({url: helpers.API_TEST_URL})
    this.httpProvider = restify.createServer()
    this.router = new Router(this.httpProvider)
    this.router.addRoutes(testRoutes, {
      allResources : function(){ return new Response('A') }
    , newResource: function(){ return new Response('N') }
    , getResource: function(){ return new Response('G') }
    , updateResource: function(){ return new Response('U') }
    , deleteResource: function(){ return new Response('D') }
    })
    this.httpProvider.listen(helpers.API_TEST_PORT, done)
  })

  after(function(){
    this.httpProvider.close()
  })

  it('GET /resource', function(done){
    this.client.get('/resource', function(err, req, res, obj){
      expect(obj).to.equal('A')
      done()
    })
  })

  it('POST /resource', function(done){
    this.client.post('/resource', {}, function(err, req, res, obj){
      expect(obj).to.equal('N')
      done()
    })
  })

  it('GET /resource/:id', function(done){
    this.client.get('/resource/:id', function(err, req, res, obj){
      expect(obj).to.equal('G')
      done()
    })
  })


  it('PUT /resource/:id', function(done){
    this.client.put('/resource/:id', {}, function(err, req, res, obj){
      expect(obj).to.equal('U')
      done()
    })
  })


  it('DELETE /resource/:id', function(done){
    this.client.del('/resource/:id', function(err, req, res, obj){
      expect(obj).to.equal('D')
      done()
    })
  })


})