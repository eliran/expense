'use strict'

angular.module('expenseApp').factory('SessionService', [
           'API_URL','$http','$q','$log','localStorageService',
  function( API_URL , $http , $q , $log , localStorageService){
    const roleActions = {
          'admin': {
            'manageUsers': true
          , 'manageExpenses': true
          }
        , 'manager': {
            'manageUsers': true
          }
        , 'user' : {
          }
        }
    var loginState = {
          token: undefined
        , user: {
            id: 0
          , loginName: ''
          , firstName: ''
          , lastName: ''
          , role: ''
          }
        }
    
    function loggedIn(state){
      setLoginState(state)
    }

    function loggedOut(){
      setLoginState({})
    }

    function setLoginState(state){
      state = state || {}
      loginState.token = state.token || undefined
      loginState.user.id = state.id || 0
      loginState.user.loginName = state.loginName || ''
      loginState.user.firstName = state.firstName || ''
      loginState.user.lastName = state.lastName || ''
      loginState.user.role = state.role || ''
      localStorageService.set('state', state)
    }

    setLoginState(localStorageService.get('state'))
    var service = {
      isLoggedIn: function(){
        return !!loginState.token
      }
    , token: function(){
        return loginState.token
      }
    , currentUser: function(){
        return Object.assign({}, loginState.user)
      }
    , login: function(loginOptions){
        return $http.post(API_URL + '/login', {
          loginName: loginOptions.loginName
        , password: loginOptions.password
        }).then(function(response){
          loggedIn(response.data)
          return response.data
        }, function(error){
          loggedOut()
          return $q.reject(error.data)
        })
      }
    , allowedTo: function(action){
        if ( !service.isLoggedIn() ) return false
        var allowed = roleActions[loginState.user.role]
        if ( !allowed ) return false
        return !!allowed[action]
      }
    , logout: function(){
        loggedOut()
      }
    }
    return service
  }
])
