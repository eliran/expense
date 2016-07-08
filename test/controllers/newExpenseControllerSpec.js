describe('New Expenses Controller', function(){
  var ctrl, $location

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  describe('when not logged in', function(){
    beforeEach(inject(function($controller, _$location_, _$httpBackend_, _API_URL_){
      $location = _$location_
      mockSessionService.loggedOut()
      ctrl = $controller('NewExpenseController')
    }))

    it('should redirect to login page', function(){
      expect($location.url()).to.equal('/login')
    })
  })

  describe('When logged in', function(){
    var $httpBackend, API_URL, $rootScope

    beforeEach(inject(function($controller, _$rootScope_,  _$location_, _$httpBackend_, _API_URL_){
      $location = _$location_
      $httpBackend = _$httpBackend_
      $rootScope = _$rootScope_
      API_URL = _API_URL_
      mockSessionService._loggedIn()

      ctrl = $controller('NewExpenseController', {
        $routeParams: { userId: 1 }
      })
    }))

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    })

    it('should have a form initially', function(){
      expect(ctrl.form).to.be.ok
    })

    it('should add an expense', function(){
      ctrl.form.date = ctrl.form.time = new Date()
      ctrl.form.description = 'description'
      ctrl.form.comment = 'comment'
      ctrl.form.amount = 100.50
      inject(function(ExpenseService){
        $httpBackend.expectPOST(API_URL + '/users/1/expenses', {
          dateTime: ExpenseService.timestampFromDate(ctrl.form.date)
        , amount: parseInt(ctrl.form.amount * 100)
        , description: ctrl.form.description
        , comment: ctrl.form.comment
        }).respond(201, expenseRecord())
        ctrl.addExpense()
        $httpBackend.flush()
      })
    })

    it('should broadcast that expenses changed', function(){
       var updated = false
       $httpBackend.expectPOST(API_URL + '/users/1/expenses').respond(201, expenseRecord())
       $rootScope.$on('expensesUpdated', function(){ updated = true })
       ctrl.addExpense()
       $httpBackend.flush()
       expect(updated).to.be.true
    })

    it('should set errorMessage on error', function(){
      $httpBackend.expectPOST(API_URL + '/users/1/expenses').respond(400, { message: 'error' })
      ctrl.addExpense()
      $httpBackend.flush()
      expect(ctrl.errorMessage).to.equal('error') 
    })
  })
})
