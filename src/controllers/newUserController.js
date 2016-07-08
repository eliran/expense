'use strict'

angular.module('expenseApp').controller('NewUserController', [
           'UserService','$location','$rootScope',
  function( UserService , $location , $rootScope ){
    var self = this
      , protectedResource = UserService.protected()
     
    self.resetForm = function(){
      self.form = {
        loginName: ''
      , password: ''
      , firstName: ''
      , lastName: ''
      , confirm: ''
      , role: 'user'
      }
    }

    self.resetForm()

    if ( protectedResource ) {
      self.create = function(){
        if ( self.form.password.length === 0 || self.form.password !== self.form.confirm ) {
          self.errorMessage = 'Password & Confirm must match'
          return false
        }
        var newUser = protectedResource.newUser(self.form)
        self.errorMessage = undefined
        newUser.$promise.then(function(){
          self.resetForm()
          $rootScope.$emit('usersUpdated')
        }, function(error){
          if ( error.data.message ) {
            self.errorMessage = error.data.message
          }
          else if ( error.data.errors ) {
            var errors = error.data.errors
            self.errorMessage = ''
            Object.keys(errors).forEach(function(key){
              self.errorMessage = self.errorMessage + key + ': ' + errors[key].join(', ') + '\n'
            })
          }
        })
        return newUser
      }
    }
    else $location.path('/login')
  }
])
