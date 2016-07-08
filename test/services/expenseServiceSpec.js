describe('Expense service', function(){
  var service, $httpBackend, API_URL
  beforeEach(module('expenseApp'))

  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  describe('when not logged in', function(){
    beforeEach(function(){
      mockSessionService.loggedOut()
    })

    it('should return null for #getUserExpenses', function(){
      inject(function(ExpenseService){
        expect(ExpenseService.getUserExpenses({userId: 1})).to.be.null 
      })
    }) 
  })

  describe('When logged in', function(){
    beforeEach(inject(function(_API_URL_, ExpenseService, _$httpBackend_){
      mockSessionService._loggedIn()
      API_URL = _API_URL_
      service = ExpenseService
      $httpBackend = _$httpBackend_
    }))

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })

    it('can request all user\'s expenses', function(){
      var sampleExpenses = [
        expenseRecord({id: 1})
      , expenseRecord({id: 2})
      , expenseRecord({id: 3})
      ]
      $httpBackend.expectGET(API_URL + '/users/1/expenses').respond(200, sampleExpenses)
      expenses = service.getUserExpenses({userId: 1})
      $httpBackend.flush()
      expect(expenses).to.have.length(sampleExpenses.length)
    })

    it('can delete all user\'s expenses', function(){
      $httpBackend.expectDELETE(API_URL + '/users/1/expenses/2').respond(204)
      var request = service.deleteUserExpense({userId: 1, expenseId: 2})
      $httpBackend.flush()
      expect(request.$resolved).to.be.true
    })

    it('can create a new expense', function(){
      var request = { dateTime: 1234, comment: 'abc', description: 'def', amount: 10000 }
      $httpBackend.expectPOST(API_URL + '/users/1/expenses', request).respond(201, {})
      var expense = service.createUserExpense({userId : 1}, request)
      $httpBackend.flush()
      expect(expense.$resolved).to.be.true
    })

    it('can get a user\'s expense', function(){
      $httpBackend.expectGET(API_URL + '/users/1/expenses/2').respond(200, {})
      var expense = service.getUserExpense({userId: 1, expenseId: 2})
      $httpBackend.flush()
      expect(expense.$resolved).to.be.true
    })

    it('can update a user\'s expense', function(){
      $httpBackend.expectPUT(API_URL + '/users/1/expenses/2').respond(200, {})
      var expense = service.updateUserExpense({userId: 1, expenseId: 2}, {})
      $httpBackend.flush()
      expect(expense.$resolved).to.be.true
    })
  })
})