'use strict'

angular.module('expenseApp').controller('SignupController', [
           'UserService','$location',
  function( UserService , $location ){
    var self = this
    self.form = {
      loginName: ''
    , password: ''
    , firstName: ''
    , lastName: ''
    , confirm: ''
    }
    self.signup = function(){
      if ( self.form.password.length === 0 || self.form.password !== self.form.confirm ) {
        self.errorMessage = 'Password & Confirm must match'
        return false
      }
      self.errorMessage = undefined
      var signupUser = UserService.signup(self.form, function(value){
        $location.path('/login')
      })
      signupUser.$promise.catch(function(error){
        self.errorMessage = error.data.message
      })
      return signupUser
    }
  }
])
