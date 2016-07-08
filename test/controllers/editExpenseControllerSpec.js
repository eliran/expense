describe('Edit Expenses Controller', function(){
  var ctrl, $location

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  describe('when not logged in', function(){
    beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
      $location = _$location_
      mockSessionService.loggedOut()
      ctrl = $controller('EditExpenseController')
    }))

    it('should redirect to login page', function(){
      expect($location.url()).to.equal('/login')
    })
  })

  describe('When logged in', function(){
    var $httpBackend, API_URL, sampleExpenseRecord = expenseRecord()

    beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
      $location = _$location_
      $httpBackend = _$httpBackend_
      API_URL = _API_URL_
      mockSessionService._loggedIn()
      $httpBackend.expectGET(API_URL + '/users/1/expenses/2').respond(200, sampleExpenseRecord)
      ctrl = $controller('EditExpenseController', {
        $routeParams: { userId: 1, expenseId: 2 }
      })
      $httpBackend.flush()
    }))

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })

    it('should have the expense filled up initially', function(){
      inject(function(ExpenseService){
        expect(ctrl.form).to.eql(ExpenseService.convertToForm(sampleExpenseRecord))
      })
    })

    it('should be able to edit an expense', function(){
      ctrl.form.date = ctrl.form.time = new Date()
      ctrl.form.description = 'description'
      ctrl.form.comment = 'comment'
      ctrl.form.amount = 100.50
      inject(function(ExpenseService){
        $httpBackend.expectPUT(API_URL + '/users/1/expenses/2', {
          dateTime: ExpenseService.timestampFromDate(ctrl.form.date)
        , amount: parseInt(ctrl.form.amount * 100)
        , description: ctrl.form.description
        , comment: ctrl.form.comment
        }).respond(200, expenseRecord())
        ctrl.updateExpense()
        $httpBackend.flush()
      })
    })

    it('should redirect back to expenses page', function(){
      $httpBackend.expectPUT(API_URL + '/users/1/expenses/2').respond(200, expenseRecord())
      ctrl.updateExpense()
      $httpBackend.flush()
      expect($location.url()).to.equal('/users/1/expenses')
    })

    it('should set errorMessage on error', function(){
      $httpBackend.expectPUT(API_URL + '/users/1/expenses/2').respond(400, { message: 'error' })
      ctrl.updateExpense()
      $httpBackend.flush()
      expect(ctrl.errorMessage).to.equal('error') 
    })
  })
})
