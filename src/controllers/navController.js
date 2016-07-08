'use strict'

angular.module('expenseApp').controller('NavController', [
           'SessionService','$location',
  function( SessionService , $location ){
    var self = this
    self.isLoggedIn = function(){
      return SessionService.isLoggedIn()
    }
   
    self.currentUser = function(){
      return SessionService.currentUser()
    }
  
    self.canManageUsers = function(){
      return SessionService.allowedTo('manageUsers')
    }

    self.logout = function(){
      SessionService.logout()
      $location.path('/')
    }
  }
])
