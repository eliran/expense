'use strict'

angular.module('expenseApp').factory('ExpenseService', [
           'API_URL','SessionService','$resource',
  function( API_URL , SessionService, $resource ){
    var obj = {
      timestampFromDate: function(date){
        return parseInt(date.getTime() / 1000)
      }
    , convertFromForm: function(form){
        return {
          dateTime: combineDateTime(form.date, form.time)
        , description: form.description
        , comment: form.comment
        , amount: parseInt(form.amount * 100)
        } 
      }
    , convertToForm: function(expense){
        var timeDate = new Date(expense.dateTime * 1000)
        return {
          amount: expense.amount / 100
        , comment: expense.comment
        , description: expense.description
        , date: timeDate
        , time: timeDate
        }
      }
    }

    addProtectedOperation('getUserExpenses')
    addProtectedOperation('createUserExpense')
    addProtectedOperation('getUserExpense')
    addProtectedOperation('updateUserExpense')
    addProtectedOperation('deleteUserExpense')
    return obj

    function combineDateTime(date, time){
      if ( date === null || time === null ) return 0
      return parseInt(date.getTime() / 1000)
    }

    function addProtectedOperation(operationId){
      obj[operationId] = function(){
        var service = protectedService()
        if ( !service ) return null
        return service[operationId].apply(service, arguments)
      }
    }

    var currentAuthToken = undefined
      , protectedResource = undefined

    function protectedService(){
      var authToken = SessionService.token()
      if ( !authToken ) return null
      if ( authToken === currentAuthToken ) return protectedResource
      var authHeader = { 'X-TOKEN': authToken }
      currentAuthToken = authToken
      protectedResource = $resource(API_URL + '/users/:userId/expenses/:expenseId', {}, {
        getUserExpenses: { method: 'GET', headers: authHeader, isArray: true }
      , deleteUserExpense: { method: 'DELETE', headers: authHeader }
      , createUserExpense: { method: 'POST', headers: authHeader }
      , getUserExpense: { method: 'GET', headers: authHeader }
      , updateUserExpense: { method: 'PUT', headers: authHeader }
      })
      return protectedResource
    }
  }
])