'use strict'

angular.module('expenseApp', [ 'ngRoute', 'ngResource', 'LocalStorageModule', 'ui.bootstrap' ])
.value('API_URL', 'http://localhost:8080/api')
.config([
           '$routeProvider',
  function( $routeProvider ){
    var sessionRequired = {
      auth: [ 'SessionService', function(SessionService) { return SessionService.isLoggedIn() } ]
    }
    $routeProvider.when('/', {
      templateUrl: 'views/home'
    }).when('/login', {
      templateUrl: 'views/login'
    }).when('/signup', {
      templateUrl: 'views/signup'
    }).when('/users', {
      templateUrl: 'views/users'
    , resolve: sessionRequired
    }).when('/users/new', {
      templateUrl: 'views/newUser'
    , resolve: sessionRequired
    }).when('/users/:userId', {
      templateUrl: 'views/userDetails'
    , resolve: sessionRequired
    }).when('/users/:userId/expenses', {
      templateUrl: 'views/expenses'
    , resolve: sessionRequired
    }).when('/users/:userId/expenses/weekly', {
      templateUrl: 'views/weeklyExpenses'
    , resolve: sessionRequired
    }).when('/users/:userId/expenses/:expenseId', {
      templateUrl: 'views/editExpense'
    , resolve: sessionRequired
    }).otherwise({ redirectTo: '/login' })
  }
])
.config([
           'localStorageServiceProvider',
  function( localStorageServiceProvider ){
    localStorageServiceProvider
      .setPrefix('expenseApp')
  }
])
