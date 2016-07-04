describe('Signup Controller', function(){
  var ctrl, $location, $rootScope, userServiceSignupInfo, signupReturn

  beforeEach(module('expenseApp'))
  beforeEach(inject(function($controller, _$location_, $q, _$rootScope_){
    $location = _$location_
    $rootScope = _$rootScope_
    signupWithData(true)
    ctrl = $controller('SignupController', {
      UserService: {
        signup: function(signupInfo){
          userServiceSignupInfo = signupInfo
          return $q(function(resolve, reject){
            return signupReturn.ok ? resolve(signupReturn.data) : reject(signupReturn.data)
          })
        }
      }
    })
  }))

  function signupWithData(success, data){
    signupReturn = {
      ok: success
    , data: { data: data || {} }
    }
  }

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
    
    function signup(){
      ctrl.signup()
      $rootScope.$apply()
    }

    describe('success', function(){
      beforeEach(signup)

      it('should pass form to userService#signup', function(){
        expect(userServiceSignupInfo).to.eql(ctrl.form)
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
        signupWithData(false, { message: 'an error' })
        signup()
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
