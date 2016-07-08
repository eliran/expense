(function(context){
  'use strict'
  var token = false
    , user = {}
  context.mockSessionService = {
    _loggedIn: function(userInfo) {
        if ( userInfo ) user = userInfo
        token = '--token--' 
    }
  , currentUser: function(){
      return user
    }
  , isLoggedIn: function(){
      return !!token
    }
  , token: function(){
      return token
    }
  , loggedOut: function(){
      token = false
    }
  , logout: function(){
      token = false
    }
  }
})(window)