'use strict'

angular.module('expenseApp').controller('LoginController', [
           'SessionService','$location',
  function( SessionService , $location){
    var self = this

    self.form = { 
      loginName: ''
    , password: '' 
    }

    self.login = function(){
      SessionService.login(self.form).then(function(data){
        $location.path('/users/' + data.id + '/expenses')
      }, function(error){
        self.errorMessage = error.message
        self.form.password = ''
      })
    }
  }
])
