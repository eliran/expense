var helpers = require('../helpers')
  , expect = helpers.expect
  , Router = helpers.Router
  , Promise = helpers.Promise
  , MockHttpProvider = require('./mockHttpProvider')

function mockResponse(){
  return {
    send: function(){}
  }
}

describe('REST API Router', function(){

  it('throws if no httpProvider is supplied', function(){
     expect(function(){ new Router() }).to.throw
  })

  describe('router', function(){
    beforeEach(function(){
      this.mockHttpProvider = new MockHttpProvider()
      this.router = new Router(this.mockHttpProvider) 
    })

    describe('#createInvoker', function(){
      it('creates invoker to object#method', function(){
        expect(this.router.createInvoker({}, 'anyMethod')).to.be.a('function')
      })

      it('throws if no method is provided', function(){
        var router = this.router
        expect(function(){ router.createInvoker({})}).to.throw
      })

      it('throws if method is not a string', function(){
        var router = this.router
        expect(function(){ router.createInvoker({}, 1)}).to.throw
      })

      it('throws if object is not an object', function(){
        var router = this.router
        expect(function(){ router.createInvoker('notAnObject', 'method') }).to.throw
      })

      describe('invoker function', function(){
        beforeEach(function(){
          this.invoker = this.router.createInvoker(this, 'invokeMethod')
        })

        it('throws if method doesn\'t exists in object', function(){
          expect(this.invoker).to.throw
        })

        it('throws if method is not a function', function(){
          this.invokeMethod = 'string'
          expect(this.invoker).to.throw
        })

        it('should invoke method when called with this set to object', function(){
          var self = this,invoked = false
          this.invokeMethod = function(){
            expect(this).to.equal(self)
            invoked = true
          }
          this.invoker({}, mockResponse(), function(){})
          expect(invoked).to.be.true
        })

        it('should call response#send and then next when from invoker', function(){
          var invokeOrder = ''
          this.invokeMethod = function(){}
          this.invoker({},{ send: function() { invokeOrder = invokeOrder + 'S' } },function(){ invokeOrder = invokeOrder + 'N' })
          expect(invokeOrder).to.equal('SN')
        })

        it('invoked method should return {status: integer, response: ...}', function(){
          var status, body
          this.invokeMethod = function(){ return { status: 1234, body: 'response' } }
          this.invoker({},{ send: function(s, b) { status = s; body = b } }, function(){})
          expect(status).to.equal(1234)
          expect(body).to.equal('response')
        })

        it('should use default invoked method return values, if missing', function(){
          this.invokeMethod = function(){}
          this.invoker({},{
            send: function(status, body){
              expect(status).to.equal(500)
              expect(body).to.have.property('code', 'InternalError')
              expect(body).to.have.property('message', 'invalid service response')
            }
          }, function(){})
        })

        it('invoked method can return a promise', function(){
          var invoked = false, defered = Promise.defer()
          this.invokeMethod = function(){ return defered.promise }
          var p = this.invoker({},{ send: function(status, body){ invoked = true } }, function(){})
          expect(invoked).to.be.false
          defered.resolve()
          return expect(p).to.eventually.be.fulfilled.then(function(){
            expect(invoked).to.be.true
          })
        })

        it('invoked method with a promise can throw an exception and converted to internalError', function(){
          var status, body, defered = Promise.defer()
          this.invokeMethod = function(){ return defered.promise }
          var p = this.invoker({},{ send: function(s, b){ status = s; body = b } }, function(){})
          defered.reject(new Error('error'))
          return expect(p).to.eventually.be.fulfilled.then(function(){
            expect(status).to.equal(500)
            expect(body).to.eql({
              code: 'InternalError'
            , message: 'error'
            })
          })

        })

        it('invoked method are passed a request object', function(){
          var requestObject = {params: {}, query: {}}
          this.invokeMethod = function(request){
            expect(request).to.eql(requestObject)
          }
          this.invoker(requestObject, mockResponse(), function(){})
        })

        it('should transfor exceptions inside invoked method to internalError', function(){
          var status, body
          this.invokeMethod = function(){
            throw Error('my error')
          }
          this.invoker({}, { send: function(s, b){ status = s; body = b } }, function(){})
          expect(status).to.equal(500)
          expect(body).to.eql({
            code: 'InternalError'
          , message: 'my error'
          })
        })

      })
    })

    describe('#addRoute', function(){
      it('registers a route with httpProvider', function(){
        var fn = this.router.addRoute('get', '/path', {}, 'method')
        expect(this.mockHttpProvider.routes).to.have.property('get:/path', fn)
      })

      it('uses \'del\' verb instead of \'delete\'', function(){
        var fn = this.router.addRoute('delete', '/path', {}, 'method')
        expect(this.mockHttpProvider.routes).to.have.property('del:/path', fn)
      })

      it('throws if a route method doesn\'t exists in the httpProvider', function(){
        var self = this
        expect(function(){ self.router.addRoute('unknown', '/path', {}, 'method') }).to.throw
      })
    })

    describe('#addRoutes', function(){
      it('registers all routes that have the following format path.HttpVerb.operationId', function(){
         var testRoutes = {
           '/routeA': {
             'get': {
               'operationId': 'routeAGet'
             }
           , 'post': {
               'operationId': 'routeAPost'
             }
           }
         , '/routeB': {
             'put': {
               'operationId': 'routeBPut'
             }
           , 'none': {
             }
           }
         }
         this.router.addRoutes(testRoutes, {})
         expect(this.mockHttpProvider.routes).to.have.keys('get:/routeA', 'post:/routeA', 'put:/routeB')
      })
    })

  })

})
                                   