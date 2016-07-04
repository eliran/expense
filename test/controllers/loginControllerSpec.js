describe('Login Controller', function(){
  var ctrl, $location, mockSessionService

  beforeEach(module('expenseApp'))

  function mockService(method){
    var response
      , mock = {
          _args: []
        , _mockResponse: function(success, data){
            response = {
              ok: success
            , data: { data: data || {} }
            }
          }
       }

    inject(function($q, $rootScope){
      mock._apply = function(){
        $rootScope.$apply() 
      }
      mock[method] = function(){
        mock._args = arguments
        return $q(function(resolve, reject){
          return response.ok ? resolve(response.data) : reject(response.data)
        })
      }
    })

    mock._mockResponse(true)
    return mock
  }

  beforeEach(inject(function($controller, _$location_){
    $location = _$location_
    mockSessionService = mockService('login')
    ctrl = $controller('LoginController', {
      SessionService: mockSessionService
    })
  }))

  it('should have a form object', function(){
    expect(ctrl.form).to.eql({
      loginName: ''
    , password: ''
    })
  })

  it('should not have an error message', function(){
    expect(ctrl.errorMesage).to.be.undefined
  })

  describe('logging in', function(){
    function login(){
      ctrl.login()
      mockSessionService._apply() 
    }


    it('should pass form to SessionService#login', function(){
      login()
      expect(mockSessionService._args[0]).to.eql(ctrl.form)
    })

    describe('successful', function(){
      beforeEach(login)

      it('should not have an error message', function(){
        expect(ctrl.errorMessage).to.be.undefined
      })

      it('should change location to /dashboard', function(){
        expect($location.url()).to.equal('/dashboard')
      })
    })

    describe('unsuccessful', function(){
      beforeEach(function(){
        mockSessionService._mockResponse(false, { message: 'an error' })
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
