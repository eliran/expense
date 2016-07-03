var helpers = require('../helpers')
  , expect = helpers.expect
  , Router = helpers.Router
  , Response = helpers.Response
  , RestifyHttpProvider = require('../../lib/restifyHttpProvider')
  , restify = require('restify')
  , testRoutes = helpers.swaggerReader(__dirname + '/testApi.yml', true).paths

describe('restify http provider', function(){
  before(function(done){
    this.client = restify.createJsonClient({url: helpers.API_TEST_URL})
    this.httpProvider = new RestifyHttpProvider()
    this.router = new Router(this.httpProvider)
    this.router.addRoutes(testRoutes, {
      allResources : function(){ return Response.ok('A') }
    , newResource: function(){ return Response.ok('N') }
    , getResource: function(){ return Response.ok('G') }
    , updateResource: function(){ return Response.ok('U') }
    , deleteResource: function(){ return Response.ok('D') }
    , getArgs: function(req){ return Response.ok({ params: req.params, query: req.query, body: req.body }) }
    })
    this.httpProvider.listen(helpers.API_TEST_PORT, done)
  })

  after(function(){
    this.httpProvider.close()
  })

  describe('passing request', function(){
    it('should get path parameters', function(done){
      this.client.get('/echo/123/abc', function(err, req, res, obj){
        expect(obj.params).to.eql({
          id: '123'
        , other: 'abc'
        })
        done()
      }) 
    })

    it('should get query parameters', function(done){
      this.client.get('/echo?q=123&other=abc', function(err, req, res, obj){
        expect(obj.query).to.eql({
          q: '123'
        , other: 'abc'
        })
        expect(obj.params).to.eql({})
        done()
      })
    })

    it('should get json body', function(done){
      var body = { key1: 'value1', key2: 5, key3: false }
      this.client.post('/echo', body, function(err, req, res, obj){
        expect(obj.body).to.eql(body)
        expect(obj.params).to.eql({})
        done()
      })

    })
  })

  describe('routing request to target object', function(){
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
      this.client.get('/resource/1', function(err, req, res, obj){
        expect(obj).to.equal('G')
        done()
      })
    })

    it('PUT /resource/:id', function(done){
      this.client.put('/resource/1', {}, function(err, req, res, obj){
        expect(obj).to.equal('U')
        done()
      })
    })

    it('DELETE /resource/:id', function(done){
      this.client.del('/resource/1', function(err, req, res, obj){
        expect(obj).to.equal('D')
        done()
      })
    })
  })

})