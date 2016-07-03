var helpers = require('../helpers')
  , expect = helpers.expect
  , Response = helpers.Response

describe('Response Object', function(){
  it('return code defaults to 200 and empty object', function(){
     var response = new Response()
     expect(response.status).to.equal(200)
     expect(response.body).to.eql({})
  })

  it('can return a response body', function(){
    var response = new Response('response')
    expect(response.status).to.equal(200)
    expect(response.body).to.equal('response')
  })

  it('can be created with both status & body', function(){
    var response = new Response(123, 'response')
    expect(response.status).to.equal(123)
    expect(response.body).to.equal('response')
  })

  describe('#ok', function(){
    it('with data: status 200', function(){
      var response = Response.ok('value')
      expect(response.status).to.equal(200)
      expect(response.body).to.equal('value') 
    })

    it('without data: status 204', function(){
      var response = Response.ok()
      expect(response.status).to.equal(204)
      expect(response.body).to.eql({})
    })
  })

  describe('#created', function(){
    it('status 201', function(){
      expect(Response.created().status).to.equal(201)
    })
  })

  describe('#errors', function(){
    it('status 400', function(){
      expect(Response.errors({}).status).to.equal(400)
    })
    it('code, errors properties', function(){
      expect(Response.errors({}).body).to.eql({
        code: 'Errors'
      , errors: {}
      })
    })
  })

  describe('#internalError', function(){
    it('with no message', function(){
      var response = Response.internalError()
      expect(response.status).to.equal(500)
      expect(response.body).to.eql({
        message: 'Internal Error'
      , code: 'InternalError'
      })
    })

    it('with message', function(){
      var response = Response.internalError('msg')
      expect(response.status).to.equal(500)
      expect(response.body).to.eql({
        message: 'msg'
      , code: 'InternalError'
      })
    })
  })
})