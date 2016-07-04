'use strict'

angular.module('expenseApp').factory('SessionService', [
           'API_URL','$http',
  function( API_URL , $http ){
    var loginState = {
          token: undefined
        , user: {
            loginName: ''
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
      loginState.token = state.token || undefined
      loginState.user.loginName = state.loginName || ''
      loginState.user.firstName = state.firstName || ''
      loginState.user.lastName = state.lastName || ''
      loginState.user.role = state.role || ''
    }

    return {
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
          if ( response.status === 200 ) loggedIn(response.data)
        }).catch(function(){
          loggedOut()
        })
      }
    , logout: function(){
        loggedOut()
      }
    }
  }
])
