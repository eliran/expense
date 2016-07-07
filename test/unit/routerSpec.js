var helpers = require('../helpers')
  , expect = helpers.expect
  , Router = helpers.Router
  , Promise = helpers.Promise
  , SessionController = helpers.SessionController
  , MockHttpProvider = require('./mockHttpProvider')
  , Response = helpers.Response

function mockResponse(){
  return {
    send: function(){}
  }
}

describe('REST API Router', function(){

  it('throws if no httpProvider is supplied', function(){
     expect(function(){ new Router() }).to.throw()
  })

  describe('router', function(){
    beforeEach(function(){
      this.mockHttpProvider = new MockHttpProvider()
      this.router = new Router(this.mockHttpProvider) 
    })

    describe('session & security', function(){
      beforeEach(function(){
        this.sessionController = new SessionController('secret')
        this.router.setSessionController(this.sessionController)
      })

      it('can have a session controller', function(){
        expect(this.router.sessionController()).to.equal(this.sessionController)
      })

      it('#protectRoute throws if no such route', function(){
        expect(function(){ this.router.protectRoute('get', '/someRoute') }).to.throw()
      })

      it('a protected route with no token header is returns \'unauthorized\'', function(){
        var invoker = this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
        this.router.protectRoute('get', '/path')
        return expect(invoke(invoker, {})).to.become(Response.unauthorized())
      })

      it('#isProtected returns if a route is protected', function(){
        this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
        expect(this.router.isProtected('get', '/path')).to.be.false
        this.router.protectRoute('get', '/path')
        expect(this.router.isProtected('get', '/path')).to.be.true
      })

      describe('when session exists', function(){
        beforeEach(function(){
          var context = this
          this.sessionState = { value: 'xx' }
          return this.sessionController.create(this.sessionState).then(function(token){
            context.sessionToken = token
          })
        })

        it('returns unauthorized if Session controller is invalid', function(){
          var invoker = this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
          this.router.protectRoute('get', '/path')
          this.router.setSessionController(null)
          return expect(invoke(invoker, { 'session-token': this.sessionToken })).to.become(Response.unauthorized())
        })

        it('returns unauthorized if token is invalid', function(){
          var invoker = this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
          this.router.protectRoute('get', '/path')
          return expect(invoke(invoker, { 'session-token': 'abc' })).to.become(Response.unauthorized())
        })

        it('allows access to protected resource when a valid token is in header ', function(){
          var invoker = this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
          this.router.protectRoute('get', '/path')
          this.onlyIfLoggedIn = function(){
            return Response.ok('logged-in')
          }
          return expect(invoke(invoker, { 'session-token': this.sessionToken })).to.become(Response.ok('logged-in'))
        })

        it('passes session data in request to method', function(){
          var state = this.sessionState, invoker = this.router.addRoute('get', '/path', this, 'onlyIfLoggedIn')
          this.router.protectRoute('get', '/path')
          this.onlyIfLoggedIn = function(req){
            return Response.ok(req.session)
          }
          return expect(invoke(invoker, { 'session-token': this.sessionToken })).to.be.fulfilled.then(function(response){
            expect(response.status).to.equal(200)
            expect(response.body).to.shallowDeepEqual(state)
          })
        }) 
      })
    })

    describe('#createInvoker', function(){
      it('creates invoker to object#method', function(){
        expect(this.router.createInvoker({}, 'anyMethod')).to.be.a('function')
      })

      it('throws if no method is provided', function(){
        var router = this.router
        expect(function(){ router.createInvoker({})}).to.throw()
      })

      it('throws if method is not a string', function(){
        var router = this.router
        expect(function(){ router.createInvoker({}, 1)}).to.throw()
      })

      it('throws if object is not an object or an array', function(){
        var router = this.router
        expect(function(){ router.createInvoker('notAnObject', 'method') }).to.throw()
      })

      describe('array of target objects', function(){
        var result, obj1, obj2
        beforeEach(function(){
          result = ''
          obj1 = { methodA: function(){ result = result + 'A' } }
          obj2 = { methodB: function(){ result = result + 'B' } }
        })
        it('invokes the method of the object that has a function with that name', function(){
          this.router.createInvoker([obj1, obj2], 'methodA')({}, mockResponse(), function(){})
          this.router.createInvoker([obj1, obj2], 'methodB')({}, mockResponse(), function(){})
          expect(result).to.equal('AB')
        })
      })

      describe('invoker function', function(){
        beforeEach(function(){
          this.invoker = this.router.createInvoker(this, 'invokeMethod')
        })

        it('throws if method doesn\'t exists in object', function(){
          expect(this.invoker).to.throw()
        })

        it('throws if method is not a function', function(){
          this.invokeMethod = 'string'
          expect(this.invoker).to.throw()
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
          expect(invoke(this.invoker)).to.become(Response.internalError('invalid sevice response'))
        })

        it('invoked method can return a promise', function(){
          var res, defered = Promise.defer()
          this.invokeMethod = function(){ return defered.promise }
          var p = this.invoker({},{ send: function(s, b){ res = { status: s, body: b } } }, function(){})
          defered.resolve(Response.ok('abc'))
          return expect(p).to.eventually.be.fulfilled.then(function(){
            expect(res).to.eql(Response.ok('abc'))
          })
        })

        it('invoked method with a promise can reject and converted to internalError', function(){
          var res, defered = Promise.defer()
          this.invokeMethod = function(){ return defered.promise }
          var p = this.invoker({},{ send: function(s, b){ res = { status: s, body: b } } }, function(){})
          defered.reject('err')
          return expect(p).to.eventually.be.fulfilled.then(function(){
            expect(res).to.eql(Response.internalError('err'))
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
          this.invokeMethod = function(){
            throw Error('my error')
          }
          return expect(invoke(this.invoker, {})).to.become(Response.internalError('my error'))
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
        expect(function(){ self.router.addRoute('unknown', '/path', {}, 'method') }).to.throw()
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
             , 'security': {
                 'token' : []
               }
             }
           , 'none': {
             }
           }
         }
         this.router.addRoutes(testRoutes, {})
         expect(this.mockHttpProvider.routes).to.have.keys('get:/routeA', 'post:/routeA', 'put:/routeB')
         expect(this.router.isProtected('put', '/routeB')).to.be.true
      })
    })

  })

})
                                   
function invoke(invoker, request){
  var defer = Promise.defer()

  invoker(request || {}, {
    send: function(status, body){
      defer.resolve({ status: status, body: body })
    }
  }, function(){})

  return defer.promise
}

