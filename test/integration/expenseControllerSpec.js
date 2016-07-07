'use strict'

var helpers = require('../helpers')
  , expect = helpers.expect
  , store = helpers.store
  , Promise = helpers.Promise
  , ExpenseController = helpers.ExpenseController
  , SessionController = helpers.SessionController
  , DUMMY_DATE = 1454202123 // 2016-01-31 01:02:03 UTC

describe('Expense Controller', function(){
  var expenseController, sampleExpense
  beforeEach(function(done){
    sampleExpense = {
      comment: 'a comment'
    , description: 'a description'
    , amount: 100
    , dateTime: DUMMY_DATE
    }
    store.ready(function(){
      var sessionController = new SessionController('secret')
      expenseController = new ExpenseController(store, sessionController)
      done()
    })
  })

  afterEach(function(){
    return store.clearDatabase()
  })

  describe('Create expense', function(){
    it('should create an expense when valid', function(){
      return expect(expenseController.newUserExpense(createRequest(sampleExpense))).to.be.fulfilled.and.then(function(response){
        expect(response.status).to.equal(201)
        sampleExpense.id = response.body.id
        expect(response.body).to.eql(sampleExpense)
      })
    })

    it('should block requests if not the logged in user', function(){
      return expect(expenseController.newUserExpense(createRequest(sampleExpense, { userId: 2 }))).to.be.eventually.have.property('status', 401)
    })

    it('should allow requests from a different user if it is an admin', function(){
      return expect(expenseController.newUserExpense(createRequest(sampleExpense, { userId: 2, role: 'admin' }))).to.be.eventually.have.property('status', 201)
    })

    it('fails if amount is smaller than 1', function(){
      sampleExpense.amount = 0
      return expect(expenseController.newUserExpense(createRequest(sampleExpense))).to.be.eventually.have.property('status', 400)
    })

    it('fails if description is blank', function(){
      sampleExpense.description = '    '
      return expect(expenseController.newUserExpense(createRequest(sampleExpense))).to.be.eventually.have.property('status', 400)
    })

  })

  describe('when having an expense', function(){
    var currentExpense
    beforeEach(function(){
      return expenseController.newUserExpense(createRequest(sampleExpense)).then(function(expense){
        currentExpense = expense.body
      })
    })

    describe('Get expense', function(){
      it('should read an expense', function(){
        return expect(expenseController.getUserExpense(createRequest({},{},currentExpense.id))).to.eventually.have.property('body').eql(currentExpense)
      })

      it('should reject if no such expense', function(){
        return expect(expenseController.getUserExpense(createRequest({},{},currentExpense.id+1))).to.eventually.have.property('status', 400)
      })

      it('should block requests if not the logged in user', function(){
        return expect(expenseController.getUserExpense(createRequest({},{ userId: 2 },currentExpense.id))).to.eventually.have.property('status', 401)
      })

      it('should allow requests from a different user if it is an admin', function(){
        return expect(expenseController.getUserExpense(createRequest({},{ userId: 2, role: 'admin' },currentExpense.id))).to.eventually.have.property('status', 200)
      })
    })

    describe('Update expense', function(){
      it('should update an expense', function(){
        return expect(expenseController.updateUserExpense(createRequest({ amount: 123 },{},currentExpense.id))).be.fulfilled.and.then(function(response){
          sampleExpense.amount = 123
          sampleExpense.id = response.body.id
          expect(response.body).to.eql(sampleExpense)
          expect(response.status).to.equal(200)
        })
      })

      it('should reject if no such expense', function(){
        return expect(expenseController.updateUserExpense(createRequest({ amount: 1 },{},currentExpense.id+1))).be.eventually.have.property('status', 400)        
      })

      it('should reject if values don\'t validate', function(){
        return expect(expenseController.updateUserExpense(createRequest({ amount: 0 },{},currentExpense.id))).be.eventually.have.property('status', 400)        
      })

      it('should block requests if not the logged in user', function(){
        return expect(expenseController.updateUserExpense(createRequest({ amount: 1 },{ userId: 2 },currentExpense.id))).to.eventually.have.property('status', 401)
      })

      it('should allow requests from a different user if it is an admin', function(){
        return expect(expenseController.updateUserExpense(createRequest({ amount: 1 },{ userId: 2, role: 'admin' },currentExpense.id))).to.eventually.have.property('status', 200)
      })
      
    })

    describe('Delete expense', function(){
      it('should delete an expense', function(){
        return expect(expenseController.deleteUserExpense(createRequest({},{},currentExpense.id))).to.eventually.have.property('status', 204)
      })

      it('should block requests if not the logged in user', function(){
        return expect(expenseController.deleteUserExpense(createRequest({}, { userId: 2 },currentExpense.id))).to.eventually.have.property('status', 401)
      })

      it('should allow requests from a different user if it is an admin', function(){
        return expect(expenseController.deleteUserExpense(createRequest({}, { userId: 2, role: 'admin' }, currentExpense.id))).to.eventually.have.property('status', 204)
      })

    })
  })

  describe('List expenses', function(){
    var comments = [ 'one', 'two' ]
      , descriptions = [ 'three', 'four' ]
    beforeEach(function(){
      var promises = []
      for ( var i = 0; i < 10; ++i ){
        promises.push(expenseController.newUserExpense(createRequest({
          comment: comments[i%comments.length]
        , description: descriptions[i%descriptions.length]
        , amount: (i+1) * 100
        , dateTime: DUMMY_DATE + (i * 60*60) // 2016-01-31 01:02:03 UTC + 1hour * i
        })))
      }
      promises.push(expenseController.newUserExpense(createRequest(sampleExpense,{ role: 'admin' },undefined,2)))
      return Promise.all(promises)
    })

    it('should be able to read all expenses', function(){
      return expect(expenseController.getUserExpenses(createRequest())).to.be.fulfilled.and.then(function(response){
        expect(response.status).to.equal(200)
        expect(response.body.expenses).to.have.length(10)
        expect(response.body.expenses[0]).to.have.keys('id', 'comment', 'dateTime', 'description', 'amount')
      })
    })

    it('should sort expenses by date DESC', function(){
      return expect(expenseController.getUserExpenses(createRequest())).to.be.fulfilled.and.then(function(response){
        var expenses = response.body.expenses
          , lastExpenseTime = expenses[0].dateTime
        for ( var i = 1; i < expenses.length; ++i ) {
          var curExpenseTime = expenses[i].dateTime
          expect(lastExpenseTime).to.be.above(curExpenseTime)
          lastExpenseTime = curExpenseTime 
        }
      })
    })

    it('should block requests if not the logged in user', function(){
      return expect(expenseController.getUserExpenses(createRequest({}, { userId: 2 }))).to.eventually.have.property('status', 401)
    })

    it('should allow requests from a different user if it is an admin', function(){
      return expect(expenseController.getUserExpenses(createRequest({}, { userId: 2, role: 'admin' }))).to.eventually.have.property('status', 200)
    })

    it('should allow filtering after startDate', function(){
      return expect(expenseController.getUserExpenses(createFilterRequest({startDate: DUMMY_DATE + 5*60*60})))
        .to.eventually.have.property('body')
           .that.have.property('expenses').that.have.length(5)
    })

    it('should allow filtering before endDate', function(){
      return expect(expenseController.getUserExpenses(createFilterRequest({endDate: DUMMY_DATE + 5*60*60})))
        .to.eventually.have.property('body')
           .that.have.property('expenses').that.have.length(6)
    })

    it('should allow filtering by text', function(){
      return expect(expenseController.getUserExpenses(createFilterRequest({query: 'four'})))
        .to.eventually.have.property('body')
           .that.have.property('expenses').that.have.length(5)
    })

    it('should allow limiting results', function(){
      return expect(expenseController.getUserExpenses(createFilterRequest({limit: 3})))
        .to.eventually.have.property('body')
           .that.have.property('expenses').that.have.length(3)
    })

    it('should allow offset results', function(){
      return expect(expenseController.getUserExpenses(createFilterRequest({offset: 6})))
        .to.eventually.have.property('body')
           .that.have.property('expenses').that.have.length(4)
    })


  })

  function createFilterRequest(query){
    var req = {
      session: {
        userId: 1
      , role: 'user'
      }
    , params: {
        userId: 1
      }
    , query: query || {}
    , body: {
      }
    }
    return req
  }

  function createRequest(body, session, id, userId){
    session = session || {}
    var req = {
      session : {
        userId: session.userId || 1
      , role: session.role || 'user'
      }
    , params: {
        userId: userId || 1
      }
    , body : body || {}
    }
    if ( id ) req.params.id = id
    return req
  }
})
