'use strict'

angular.module('expenseApp').controller('EditUserController', [
           'UserService','$location','$routeParams',
  function( UserService , $location , $routeParams ){
    var self = this
      , userId = $routeParams.userId
      , protectedResource = UserService.protected()

    self.loginName = ''

    self.form = {
      firstName: ''
    , lastName: ''
    , role: ''
    }

    self.password = {
      current: ''
    , newPassword: ''
    , confirm: ''
    }

    if ( protectedResource ) {
      protectedResource.get({userId: userId}).$promise.then(function(user){
        updateUserForm(user)
      }, function(error){
        self.errorMessage = error.data.message
      })

      self.changePassword = function(){
        if ( self.password.newPassword.length === 0 || self.password.newPassword !== self.password.confirm ) {
          self.errorMessage = 'Password & Confirm must match'
          return false
        }
        self.errorMessage = undefined
        protectedResource.update({userId: userId}, {
          newPassword: self.password.newPassword
        , password: self.password.current
        }).$promise.then(function(){
          self.message = 'Password changed'
        }, function(error){
          self.errorMessage = error.data.message
        })
      }

      self.update = function(){
        self.errorMessage = undefined
        var updatedUser = protectedResource.update({userId: userId}, self.form)
        updatedUser.$promise.then(function(user){
          updateUserForm(user)
          self.message = 'User Info updated'
        }, function(error){
          self.errorMessage = error.data.message
        })
        return updatedUser
      }

      function updateUserForm(user){
        self.loginName = user.loginName
        self.form.firstName = user.firstName
        self.form.role = user.role
        self.form.lastName = user.lastName

        self.password.current = self.password.newPassword = self.password.confirm = ''
      }
    }
    else $location.path('/login')
  }
])
