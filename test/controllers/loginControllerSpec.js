describe('Login Controller', function(){
  var ctrl, $location

  beforeEach(module('expenseApp'))

  beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
    $location = _$location_
    $httpBackend = _$httpBackend_
    API_URL = _API_URL_
    ctrl = $controller('LoginController')
  }))

  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('should have a form object', function(){
    expect(ctrl.form).to.eql({
      loginName: ''
    , password: ''
    })
  })

  it('should not have an error message', function(){
    expect(ctrl.errorMesage).to.be.undefined
  })

  var loginResponse
  function mockSuccessful(expectedData){
    loginResponse = angular.extend(userRecord(), { token: '--jwt-token--' })
    $httpBackend.expectPOST(API_URL + '/login', expectedData).respond(200, loginResponse)
  }

  function mockFailed(msg){
    $httpBackend.expectPOST(API_URL + '/login').respond(401, { message: msg })
  }

  describe('logging in', function(){
    function login(){
      ctrl.login()
      $httpBackend.flush()
    }

    describe('successful', function(){
      beforeEach(function(){
        mockSuccessful(ctrl.form)
        login()
      })

      it('should not have an error message', function(){
        expect(ctrl.errorMessage).to.be.undefined
      })

      it('should change location to /users/:id/expenses', function(){
        expect($location.url()).to.equal('/users/1/expenses')
      })
    })

    describe('unsuccessful', function(){
      beforeEach(function(){
        mockFailed('an error')
        login()
      })

      it('should not change location', function(){
        expect($location.url()).to.equal('')
      })

      it('should have an error message', function(){
        expect(ctrl.errorMessage).to.equal('an error')
      })
    })
  })

})
