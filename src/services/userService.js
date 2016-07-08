'use strict'

angular.module('expenseApp').factory('UserService', [
           'API_URL','SessionService','$resource','$log',
  function( API_URL , SessionService , $resource , $log ){
    var currentAuthToken = undefined
      , protectedResource = undefined
      , service = $resource(API_URL + '/users', {}, {
          signup: { method: 'POST' }
        })
    service.protected = function(){
      var authToken = SessionService.token()
      if ( !authToken ) return null
      if ( authToken === currentAuthToken ) return protectedResource
      var authHeader = { 'X-TOKEN': authToken }
      currentAuthToken = authToken
      protectedResource = $resource(API_URL + '/users/:userId', {}, {
        newUser: { method: 'POST', headers: authHeader }
      , findUsers: { method: 'GET', headers: authHeader, isArray: true }
      , get: { method: 'GET', headers: authHeader }
      , update: { method: 'PUT', headers: authHeader }
      , delete: { method: 'DELETE', headers: authHeader }
      })
      return protectedResource
    }
    return service
  }
])
