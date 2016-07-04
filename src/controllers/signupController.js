'use strict'

angular.module('expenseApp').controller('SignupController', [
           'UserService','$location','$log',
  function( UserService , $location , $log){
    var self = this
    self.form = {
      loginName: ''
    , password: ''
    , firstName: ''
    , lastName: ''
    , confirm: ''
    }
    self.message = 'all ok'
    self.signup = function(){
      return UserService.signup(self.form).then(function(){
        $location.path('/login')
      }, function(error){
         self.errorMessage = error.data.message
      })
    }
  }
])
