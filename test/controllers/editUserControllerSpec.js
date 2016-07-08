describe('Edit Users Controller', function(){
  var $httpBackend, ctrl, userInfo = {
    id: 1
  , loginName: 'a@d.com'
  , firstName: 'first'
  , lastName: 'last'
  , role: 'admin'
  }

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  beforeEach(inject(function($controller, _$httpBackend_, _$rootScope_, _API_URL_){
    $httpBackend = _$httpBackend_
    API_URL = _API_URL_
    mockSessionService._loggedIn()
    $httpBackend.expectGET(API_URL + '/users/1').respond(200, userInfo)

    ctrl = $controller('EditUserController', {
      $routeParams: { userId: 1 }
    })
    _$rootScope_.$apply()
    $httpBackend.flush()
  }))

  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('should have a prefilled for object', function(){
    expect(ctrl.form).to.eql({
      firstName: userInfo.firstName
    , lastName: userInfo.lastName
    , role: userInfo.role
    })
  })

  describe('update user', function(){
    beforeEach(function(){
      ctrl.form = {
        firstName: 'first'
      , lastName: 'last'
      , loginName: 'a@b.com'
      }
    })

    var response
    function mockSuccessful(info){
      response = userRecord()
      $httpBackend.expectPUT(API_URL + '/users/1', info).respond(201, response)
    }

    function mockFailed(){
      $httpBackend.expectPUT(API_URL + '/users/1').respond(401, { message: 'an error'})
    }

    var requestObject
    function update(){
      requestObject = ctrl.update()
    }

    describe('on success', function(){
      beforeEach(function(){
        mockSuccessful(ctrl.form)
        update()
        $httpBackend.flush()
      })

      it('should receive updated user back', function(){
        expect(requestObject).to.resourceEql(response)
      })

      it('should not have an errorMessage', function(){
        expect(ctrl.errorMessage).to.be.undefined
      })

      it('should have a success message', function(){
        expect(ctrl.message).to.be.ok
      })
    })

    describe('on failure', function(){
      beforeEach(function(){
        mockFailed()
        update()
        $httpBackend.flush()
      })

      it('should have an errorMessage', function(){
        expect(ctrl.errorMessage).to.equal('an error') 
      })
    })
  })
})
