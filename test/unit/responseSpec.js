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

  it('#internalError', function(){
    var response = Response.internalError()
    expect(response.status).to.equal(500)
    expect(response.body).to.eql({
      message: 'Internal Error'
    , code: 'InternalError'
    })
  })

  it('#internalError with message', function(){
    var response = Response.internalError('msg')
    expect(response.status).to.equal(500)
    expect(response.body).to.eql({
      message: 'msg'
    , code: 'InternalError'
    })
  })
})