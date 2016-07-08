'use strict'

angular.module('expenseApp').controller('EditExpenseController', [
           'SessionService','ExpenseService','$location','$routeParams',
  function( SessionService , ExpenseService , $location , $routeParams ){
    var self = this
      , userId = $routeParams.userId
      , expenseId = $routeParams.expenseId

    if ( !SessionService.isLoggedIn() ) {
      $location.path('/login')
      return {}
    }

    self.form = {
      date: null
    , time: null
    , description: ''
    , comment: ''
    , amount: 0
    }

    ExpenseService.getUserExpense({userId : userId, expenseId: expenseId}).$promise.then(function(expense){
      self.form = ExpenseService.convertToForm(expense)
    }, function(error){
      self.errorMessage = error.data.message
    })

    self.updateExpense = function(){
      self.errorMessage = undefined
      var expense = ExpenseService.updateUserExpense({userId: userId, expenseId: expenseId}, ExpenseService.convertFromForm(self.form))
      expense.$promise.then(function(){
        $location.path('/users/' + userId + '/expenses')
      }, function(error){
        self.errorMessage = error.data.message
      })
      return expense
    }

  }
])
