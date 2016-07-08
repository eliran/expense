(function(context){
  'use strict' 
  context.mockResourceMethod = function(isArray){
    var fn, nextResponse
    inject(function($q, $rootScope){
      fn = function(){
        fn._args = arguments
        var resourceObject = isArray ? [] : {}
        resourceObject.$promise = $q(function(resolve, reject){
          if ( isArray ) {
            resourceObject.push.apply(resourceObject, nextResponse.data.data)
          }
          else angular.extend(resourceObject, nextResponse.data)
          return nextResponse.ok ? resolve(nextResponse.data) : reject(nextResponse.data)
        })
        return resourceObject
      }
      fn._args = []
      fn._response = function(success, data){
        nextResponse = {
          ok: success
        , data: { data: data || {} }
        }
      }
      fn._apply = function(){
        $rootScope.$apply() 
      }
      fn._response(true)
    })
    return fn
  }

})(window)