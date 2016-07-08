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
        id: 0
      , loginName: ''
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
    
    describe('roles', function(){

      describe(': admin', function(){
        beforeEach(function(){
          return loginWithRole('admin')
        })

        it('manageUsers allowed', function(){
          expect(service.allowedTo('manageUsers')).to.be.true
        }) 

        it('manageExpenses allowed', function(){
          expect(service.allowedTo('manageExpenses')).to.be.true
        }) 
      })

      describe(': manager', function(){
        beforeEach(function(){
          return loginWithRole('manager')
        })

        it('manageUsers allowed', function(){
          expect(service.allowedTo('manageUsers')).to.be.true
        }) 

        it('manageExpenses not allowed', function(){
          expect(service.allowedTo('manageExpenses')).to.be.false
        }) 
      })

      describe(': user', function(){
        beforeEach(function(){
          return loginWithRole('user')
        })

        it('manageUsers not allowed', function(){
          expect(service.allowedTo('manageUsers')).to.be.false
        }) 

        it('manageExpenses not allowed', function(){
          expect(service.allowedTo('manageExpenses')).to.be.false
        }) 
      })

      function loginWithRole(role){
        mockBackend.expectPOST(URL + '/login').respond({
          token: '--token--'
        , id: 1
        , loginName: 'loginName'
        , firstName: 'first'
        , lastName: 'last'
        , role: role
        })
        var promise = service.login(dummyLogin)
        mockBackend.flush() 
        return 
      }
    })

    describe(': unsuccessfully', function(){
      beforeEach(function(){
        mockBackend.expectPOST(URL + '/login').respond(401,{ message: 'error' })
      })

      it('should stay logged out', function(){
        service.login(dummyLogin)
        mockBackend.flush()
        expectLoggedOut(service)
      })

      it ('should return error object in promise catch', function(){
        expect(service.login(dummyLogin)).to.be.rejectedWith({message: 'error'})
        mockBackend.flush()
      })
    })

    describe(': successfully', function(){
      var sentResponse, promise, userInfo = {
        id: 1
      , loginName: 'loginName'
      , firstName: 'first'
      , lastName: 'last'
      , role: 'user'
      }

      beforeEach(function(){
        sentResponse = Object.assign({token: '--jwt-token--'}, userInfo)
        mockBackend.expectPOST(URL + '/login').respond(sentResponse)
        promise = service.login(dummyLogin)
        mockBackend.flush() 
      })

      it('should return login user in promise', function(){
        expect(promise).to.become(sentResponse)
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
          , id: 2
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
            id: 2
          , loginName: 'otherLogin'
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
