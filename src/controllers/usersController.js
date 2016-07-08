'use strict'

angular.module('expenseApp').controller('UsersController', [
           'UserService','SessionService','$location','$rootScope',
  function( UserService , SessionService , $location , $rootScope ){
    var self = this
      , protectedResource = UserService.protected()
    self.users = []

    self.canManageExpenses = function(){
      return SessionService.allowedTo('manageExpenses')
    }

    if ( protectedResource ) {

      var deregister = $rootScope.$on('usersUpdated', function(){
        fetchUsers()
      })

      fetchUsers()

      self.editUser = function(userId){
        $location.url('/users/' + userId)
      }

      self.deleteUser = function(userId){
        protectedResource.delete({userId: userId}).$promise.then(function(){
          fetchUsers()
        })
      }

      self.manageExpenses = function(userId){
        $location.url('/users/' + userId + '/expenses')
      }

      self.createUser = function(){
        $location.url('/users/new')
      }

      function fetchUsers(){
        self.users = protectedResource.findUsers()
      }
    }
    else $location.path('/login')
  }
])
