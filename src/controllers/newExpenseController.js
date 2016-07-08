'use strict'

angular.module('expenseApp').controller('NewExpenseController', [
           'SessionService','ExpenseService','$location','$routeParams','$rootScope',
  function( SessionService , ExpenseService , $location , $routeParams , $rootScope ){
    var self = this
      , userId = $routeParams.userId

    if ( !SessionService.isLoggedIn() ) {
      $location.path('/login')
      return {}
    }

    self.form = {}

    self.resetForm = function(){
      var today = new Date()
      self.form = {
        date: self.form.date || today
      , time: self.form.time || today
      , description: ''
      , comment: ''
      , amount: ''
      }
    }

    self.resetForm()

    self.datePopupOpen = false
    self.openDate = function(){
      self.datePopupOpen = true
    }

    self.addExpense = function(){
      self.errorMessage = undefined
      var expense = ExpenseService.createUserExpense({userId: userId}, ExpenseService.convertFromForm(self.form))
      expense.$promise.then(function(){
        $rootScope.$emit('expensesUpdated')
        self.resetForm()
      }, function(error){
        if ( error.data.message ) {
          self.errorMessage = error.data.message
        }
        else if ( error.data.errors ) {
          var errors = error.data.errors
          self.errorMessage = ''
          Object.keys(errors).forEach(function(key){
            self.errorMessage = self.errorMessage + key + ': ' + errors[key].join(', ') + '\n'
          })
        }
      })
      return expense
    }

  }
])