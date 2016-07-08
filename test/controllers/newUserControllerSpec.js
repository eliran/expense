describe('New Users Controller', function(){
  var ctrl

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
    $location = _$location_
    $httpBackend = _$httpBackend_
    API_URL = _API_URL_
    ctrl = $controller('NewUserController')
    mockSessionService._loggedIn()
  }))

  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('should have a form object', function(){
    expect(ctrl.form).to.eql({
      firstName: ''
    , lastName: ''
    , loginName: ''
    , password: ''
    , confirm: ''
    , role: 'user'
    })
  })

  describe('create user', function(){
    beforeEach(function(){
      ctrl.form = {
        firstName: 'first'
      , lastName: 'last'
      , loginName: 'a@b.com'
        , password: '12345678'
        , confirm: '12345678'
      }
    })

    var response
    function mockSuccessful(info){
      response = userRecord()
      $httpBackend.expectPOST(API_URL + '/users', info).respond(201, response)
    }

    function mockFailed(){
      $httpBackend.expectPOST(API_URL + '/users').respond(401, { message: 'an error'})
    }

    var requestObject
    function create(){
      requestObject = ctrl.create()
    }

    describe('on success', function(){
      beforeEach(function(){
        mockSuccessful(ctrl.form)
        create()
        $httpBackend.flush()
      })

      it('should receive created user back', function(){
        expect(requestObject).to.resourceEql(response)
      })

      it('should not have an errorMessage', function(){
        expect(ctrl.errorMessage).to.be.undefined
      })

    })

    describe('on failure', function(){
      beforeEach(function(){
        mockFailed()
        create()
        $httpBackend.flush()
      })

      it('should have an errorMessage', function(){
        expect(ctrl.errorMessage).to.equal('an error') 
      })

    })
  })
})
