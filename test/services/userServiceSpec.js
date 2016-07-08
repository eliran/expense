describe('User service', function(){
  var service, mockBackend, URL, mockToken
  beforeEach(module('expenseApp'))

  // Mock SessionService
  beforeEach(module(function($provide){
    mockToken = false
    $provide.value('SessionService', {
      token: function(){ return mockToken }
    })
  }))

  beforeEach(inject(function(API_URL, UserService, $httpBackend, $rootScope){
    URL = API_URL
    service = UserService
    mockBackend = $httpBackend
  }))

  afterEach(function(){
    mockBackend.verifyNoOutstandingExpectation()
    mockBackend.verifyNoOutstandingRequest()
  })

  const signupInfo = {
    loginName: 'name@domain.com'
  , firstName: 'first'
  , lastName: 'last'
  , password: '12345678'
  }

  it('should allow a user to signup', function(){
    var signupResponse = userRecord(signupInfo)
    mockBackend.expectPOST(URL + '/users', signupInfo).respond(201, signupResponse)
    var newUser = service.signup(signupInfo)
    mockBackend.flush()
    expect(newUser).to.deep.resource.equal(signupResponse)
  })

  it('should not allow usage of protected resources without a session', function(){
    expect(service.protected()).to.be.null
  })

  describe('when having an active session', function(){

    beforeEach(function(){
      mockToken = 'xxxxxxx'
    })

    function expectSessionToken(headers){
      return headers['X-TOKEN'] === mockToken
    }
    
    it('returns a protected resource', function(){
      expect(service.protected()).to.be.ok
    })
      
    it('returns the same protected instance when session token is the same', function(){
      expect(service.protected()).to.equal(service.protected())
    })
 
    it('returns a different protected instance when session token is changed', function(){
      var firstProtected = service.protected()
      mockToken = 'yyyyy'
      expect(firstProtected).to.not.equal(service.protected())
    })

    it('returns null when session closes', function(){
      mockToken = undefined
      expect(service.protected()).to.be.null
    })

    it('can retrive all users', function(){
      var users = [
        userRecord({id: 1, loginName: 'a@d.com'})
      , userRecord({id: 2, loginName: 'b@d.com'})
      , userRecord({id: 3, loginName: 'c@d.com'})
      ]
      mockBackend.expectGET(URL + '/users', expectSessionToken).respond(users)
      var returnedUsers = service.protected().findUsers()
      mockBackend.flush()
      expect(returnedUsers).to.deep.resource.equal(users)
    }) 

    it('can create a user', function(){
      var user = userRecord(signupInfo)
      mockBackend.expectPOST(URL + '/users', signupInfo, expectSessionToken).respond(201, user)
      var returnedUser = service.protected().newUser(signupInfo)
      mockBackend.flush()
      expect(returnedUser).to.deep.resource.equal(user)
    })

    it('can retrive a user', function(){
      var user = userRecord()
      mockBackend.expectGET(URL + '/users/123', expectSessionToken).respond(user)
      var returnedUser = service.protected().get({userId: 123})
      mockBackend.flush()
      expect(returnedUser).to.deep.resource.equal(user)
    })

    it('can update a user', function(){
      var user = userRecord()
      mockBackend.expectPUT(URL + '/users/123', user, expectSessionToken).respond(user)
      var returnedUser = service.protected().update({userId: 123}, user)
      mockBackend.flush()
      expect(returnedUser).to.deep.resource.equal(user)
    })

    it('can delete a user', function(){
      mockBackend.expectDELETE(URL + '/users/123', expectSessionToken).respond(204)
      service.protected().delete({userId: 123})
      mockBackend.flush()
    })

  })

})