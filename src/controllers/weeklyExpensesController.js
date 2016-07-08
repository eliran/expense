'use strict'

angular.module('expenseApp').controller('WeeklyExpensesController', [
           'ExpenseService','$routeParams',
  function( ExpenseService , $routeParams ){
    var self = this
      , userId = $routeParams.userId

    self.report = []

    ExpenseService.getUserExpenses({ userId: userId, expenseId: 'weekly' }).$promise.then(function(report){
      self.report = report.map(function(entry){
        entry.startDate = new Date(entry.startDate * 1000)
        entry.endDate = new Date(entry.endDate * 1000)
        entry.avrPerDay = entry.totalDays > 0 ? formatCurrency(parseInt(entry.totalAmount / entry.totalDays)) : 0
        entry.totalAmount = formatCurrency(entry.totalAmount)
        return entry
      })
    }, function(error){
      self.errorMessage = error.data.message
    })

    function formatCurrency(amount){
      return parseInt(amount / 100) + '.' + doubleDigit(amount%100)
    }

    function doubleDigit(value){
      if ( value < 10 ) return '0' + value
      return value
    }

  }
])