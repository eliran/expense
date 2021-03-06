describe('Signup Controller', function(){
  var ctrl, $location, $httpBackend, API_URL

  beforeEach(module('expenseApp'))
  
  beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
    $location = _$location_
    $httpBackend = _$httpBackend_
    API_URL = _API_URL_
    ctrl = $controller('SignupController')
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
    })
  })

  it('should not have an errorMessage', function(){
    expect(ctrl.errorMessage).to.be.undefined
  })

  describe('signup', function(){
    beforeEach(function(){
      ctrl.form = {
        firstName: 'first'
      , lastName: 'last'
      , loginName: 'a@b.com'
        , password: '12345678'
        , confirm: '12345678'
      }
    })

    var signupResponse
    function mockSuccessfulSignup(info){
      signupResponse = userRecord()
      $httpBackend.expectPOST(API_URL + '/users', info).respond(201, signupResponse)
    }

    function mockFailedSignup(){
      $httpBackend.expectPOST(API_URL + '/users').respond(401, { message: 'an error'})
    }

    var signupObject
    function signup(){
      signupObject = ctrl.signup()
    }

    describe('success', function(){
      beforeEach(function(){
        mockSuccessfulSignup(ctrl.form)
        signup()
        $httpBackend.flush()
      })

      it('should receive signed up user back', function(){
        expect(signupObject).to.resourceEql(signupResponse)
      })

      it('should not have an errorMessage', function(){
        expect(ctrl.errorMessage).to.be.undefined
      })

      it('should redirect to login page', function(){
        expect($location.url()).to.equal('/login')
      })
    })

    describe('failure', function(){
      beforeEach(function(){
        mockFailedSignup()
        signup()
        $httpBackend.flush()
      })

      it('should have an errorMessage', function(){
        expect(ctrl.errorMessage).to.equal('an error') 
      })

      it('should not change location', function(){
        expect($location.url()).to.equal('')
      })
    })

  })
})
