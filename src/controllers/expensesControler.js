'use strict'

angular.module('expenseApp').controller('ExpensesController', [
           'SessionService','ExpenseService','$location','$routeParams','$rootScope',
  function( SessionService , ExpenseService , $location , $routeParams , $rootScope ){
    var self = this
      , userId = $routeParams.userId

    if ( !SessionService.isLoggedIn() ) {
      $location.path('/login')
      return {}
    }

    self.filter = {
      useStartDate: false
    , startDate: new Date()
    , useEndDate: false
    , endDate: new Date()
    , useSearch: false
    , searchText: ''
    }

    self.startDatePopupOpen = self.endDatePopupOpen = false

    self.openStartDate = function(){
      self.closePopups()
      self.startDatePopupOpen = true
    }

    self.openEndDate = function(){
      self.closePopups()
      self.endDatePopupOpen = true
    }

    self.closePopups = function(){
      self.startDatePopupOpen = self.endDatePopupOpen = false
    }

    var deregister = $rootScope.$on('expensesUpdated', function(){
      fetchExpenses()
    })

    fetchExpenses()

    self.editExpense = function(expenseId){
      $location.path('/users/' + userId + '/expenses/' + expenseId)
    }

    self.deleteExpense = function(expenseId){
      ExpenseService.deleteUserExpense({userId: userId, expenseId: expenseId}).$promise.then(function(){
        fetchExpenses()
      }, function(error){
        self.errorMessage = error.data.message
      })
    }

    self.reportExpenses = function(){
      $location.path('/users/' + userId + '/expenses/weekly' )
    }

    self.filterExpenses = fetchExpenses
    self.timestampFromDate = ExpenseService.timestampFromDate

    function fetchExpenses(){
      var params = { 
       userId: userId
      }
      if ( self.filter.useStartDate ) params.startDate = self.timestampFromDate(self.filter.startDate)
      if ( self.filter.useEndDate ) params.endDate = self.timestampFromDate(self.filter.endDate)
      if ( self.filter.useSearch ) params.query = self.filter.searchText

      ExpenseService.getUserExpenses(params).$promise.then(function(expenses){
        self.expenses = expenses.map(function(expense){
          expense.dateTime = formatDate(expense.dateTime)
          expense.amount = formatCurrency(expense.amount)
          return expense
        })
      })
    }

    function formatCurrency(amount){
      return parseInt(amount / 100) + '.' + doubleDigit(amount%100)
    }

    function formatDate(dateTime){
      var date = new Date(dateTime * 1000)
        , day = date.getDate()
        , month = date.getMonth() + 1
        , year = date.getFullYear()
        , h = date.getHours()
        , m = date.getMinutes()
      return doubleDigit(month) + '/' + doubleDigit(day) + '/' + year + ' @ ' + doubleDigit(h) + ':' + doubleDigit(m)
    }
  
    function doubleDigit(value){
      if ( value < 10 ) return '0' + value
      return value
    }
  }
])