describe('Users Controller', function(){
  var ctrl, mockUserService

  beforeEach(module('expenseApp'))
  beforeEach(function(){
    var findUsers = mockResourceMethod(true)
      , protected = {
          findUsers: findUsers
        }
    mockUserService = {
      protected: function(){
        return protected
      }
    }
  })

  beforeEach(function(){
    this.users = [
      userRecord({id: 1, loginName: 'a@test.com'})
    , userRecord({id: 2, loginName: 'b@test.com'})
    , userRecord({id: 3, loginName: 'c@test.com'})
    ]
  })

  function loadController(){
    inject(function($controller){
      ctrl = $controller('UsersController', {
        UserService: mockUserService
      })
    })

  }

  describe('on success', function(){
    beforeEach(function(){
      var findUsers = mockUserService.protected().findUsers
      findUsers._response(true, this.users)
      loadController()
      findUsers._apply()
    })

    it('should not have an errorMessage', function(){
      expect(ctrl.errorMessage).to.be.undefined
    })

    it('should load all users when controller is starting', function(){
      expect(ctrl.users.slice(0)).to.eql(this.users)
    })

    it('should change location when calling #editUser', function(){
      inject(function($location){
        ctrl.editUser(2)
        expect($location.url()).to.equal('/users/2')
      })
    })
  })

  describe('on failure', function(){
  })

})
