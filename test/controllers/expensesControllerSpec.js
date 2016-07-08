describe('Expenses Controller', function(){
  var ctrl, $location, $rootScope

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  describe('when not logged in', function(){
    beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
      $location = _$location_
      mockSessionService.loggedOut()
      ctrl = $controller('ExpensesController')
    }))

    it('should redirect to login page', function(){
      expect($location.url()).to.equal('/login')
    })
  })

  describe('When logged in', function(){
    var $httpBackend, API_URL, sampleExpenses = [
      expenseRecord({id: 1})
    , expenseRecord({id: 2})
    , expenseRecord({id: 3})
    , expenseRecord({id: 4})
    , expenseRecord({id: 5})
    ]

    beforeEach(inject(function($controller, _$location_, _$httpBackend_, _$rootScope_, _API_URL_){
      $location = _$location_
      $httpBackend = _$httpBackend_
      API_URL = _API_URL_
      mockSessionService._loggedIn()
      $rootScope = _$rootScope_

      $httpBackend.expectGET(API_URL + '/users/1/expenses').respond(200, sampleExpenses)
      ctrl = $controller('ExpensesController', {
        $routeParams: { userId: 1 }
      })
      $httpBackend.flush()
    }))

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })

    it('should fetch user\'s expenses', function(){
      expect(ctrl.expenses).to.have.length(sampleExpenses.length)
    })

    it('should refresh expenses when expesesUpdated event broadcasts', function(){
       $httpBackend.expectGET(API_URL + '/users/1/expenses').respond(200, sampleExpenses)
       $rootScope.$emit('expensesUpdated')
       $httpBackend.flush()
    })

    it('should have a filter object', function(){
      expect(ctrl.filter).to.be.ok
    })

    it('#editExpense: should route to /users/:id/expenses/:expenseId', function(){
      ctrl.editExpense(2)
      expect($location.url()).to.equal('/users/1/expenses/2')
    })

    it('#deleteExpense: should delete an expense', function(){
      $httpBackend.expectDELETE(API_URL + '/users/1/expenses/2').respond(204)
      $httpBackend.expectGET(API_URL + '/users/1/expenses').respond(200, sampleExpenses.slice(1))
      ctrl.deleteExpense(2)
      $httpBackend.flush()
      expect(ctrl.expenses).to.have.length(sampleExpenses.length-1)
    })

    it('#deleteExpense: should set errorMessage on error', function(){
      $httpBackend.expectDELETE(API_URL + '/users/1/expenses/2').respond(400, { message: 'error' })
      ctrl.deleteExpense(2)
      $httpBackend.flush()
      expect(ctrl.errorMessage).to.equal('error')
    })

    describe('#filterExpenses filters', function(){
      it('uses start date', function(){
        ctrl.filter.startDate = new Date()
        ctrl.filter.useStartDate = true
        $httpBackend.expectGET(API_URL + '/users/1/expenses?startDate=' + ctrl.timestampFromDate(ctrl.filter.startDate)).respond(200, [])
        ctrl.filterExpenses()
        $httpBackend.flush() 
      })


      it('uses end date', function(){
        ctrl.filter.endDate = new Date()
        ctrl.filter.useEndDate = true
        $httpBackend.expectGET(API_URL + '/users/1/expenses?endDate=' + ctrl.timestampFromDate(ctrl.filter.endDate)).respond(200, [])
        ctrl.filterExpenses()
        $httpBackend.flush() 
      })

      it('uses searchText', function(){
        ctrl.filter.searchText = 'a string'
        ctrl.filter.useSearch = true
        $httpBackend.expectGET(API_URL + '/users/1/expenses?query=a+string').respond(200, [])
        ctrl.filterExpenses()
        $httpBackend.flush() 
      })

    })
  })

})