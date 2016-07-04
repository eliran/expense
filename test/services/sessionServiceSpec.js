describe('Session Service', function(){
  var service, URL
  beforeEach(module('expenseApp'))
  beforeEach(inject(function(API_URL, SessionService){
    service = SessionService
    URL = API_URL
  }))

  it('should initially not logged in', function(){
    expect(service.isLoggedIn()).to.be.false
  })

  it('should have undefined token', function(){
    expect(service.token()).is.undefined
  })

  var emptyUser = {
        loginName: ''
      , firstName: ''
      , lastName: ''
      , role: ''
      }
    , dummyLogin = {
        loginName: 'user@name.com'
      , password: 'password'
      }

  it('should initially return an empty current user', function(){
    expect(service.currentUser()).to.eql(emptyUser)
  })

  function expectLoggedOut(service){
    expect(service.isLoggedIn()).to.be.false
    expect(service.currentUser()).to.eql(emptyUser)
    expect(service.token()).to.be.undefined
  }

  describe('when logging in', function(){
    var mockBackend
    beforeEach(inject(function($httpBackend){
      mockBackend = $httpBackend
    }))

    afterEach(function(){
      mockBackend.verifyNoOutstandingExpectation()
      mockBackend.verifyNoOutstandingRequest()
    })
    
    describe(': unsuccessfully', function(){
      beforeEach(function(){
        mockBackend.expectPOST(URL + '/login').respond(401,{})
      })

      it('should stay logged out', function(){
        service.login(dummyLogin)
        mockBackend.flush()
        expectLoggedOut(service)
      })
    })

    describe(': successfully', function(){
      var userInfo = {
        loginName: 'loginName'
      , firstName: 'first'
      , lastName: 'last'
      , role: 'user'
      }
      beforeEach(function(){
        mockBackend.expectPOST(URL + '/login').respond(Object.assign({token: '--jwt-token--'}, userInfo))
        service.login(dummyLogin)
        mockBackend.flush() 
      })

      it('should have session token', function(){
        expect(service.token()).to.equal('--jwt-token--')
      })

      it('#isLoggedIn should be true after successful login', function(){
        expect(service.isLoggedIn()).to.be.true
      })

      it('#currentUser should return logged in user info', function(){
        expect(service.currentUser()).to.eql(userInfo)
      })

      describe('when logged in', function(){
        it('should be able to login as a different user', function(){
          mockBackend.expectPOST(URL + '/login').respond({
            token: '--other-jwt-token--'
          , loginName: 'otherLogin'
          , firstName: 'otherFirst'
          , lastName: 'otherLast'
          , role: 'manager'
          })
          service.login(dummyLogin)
          mockBackend.flush()
          expect(service.isLoggedIn()).to.be.true
          expect(service.token()).to.equal('--other-jwt-token--')
          expect(service.currentUser()).to.eql({
            loginName: 'otherLogin'
          , firstName: 'otherFirst'
          , lastName: 'otherLast'
          , role: 'manager'
          })
        })

        it('should logout if login again is failed', function(){
          mockBackend.expectPOST(URL + '/login').respond(401,{})
          service.login(dummyLogin)
          mockBackend.flush()
          expectLoggedOut(service)
        })

        it('should be able to logout', function(){
          service.logout()
          expectLoggedOut(service)
        })
      })
    })
  })
})
