'use strict'

var helpers = require('../helpers')
  , expect = helpers.expect
  , store = helpers.store
  , Promise = helpers.Promise
  , ExpenseController = helpers.ExpenseController
  , ExpenseReportsController = helpers.ExpenseReportsController
  , SessionController = helpers.SessionController
  , DUMMY_DATE = 1454202123 // 2016-01-31 01:02:03 UTC

describe('Expense Report Controller', function(){
  var expenseController, reportController
  beforeEach(function(done){
    store.ready(function(){
      var sessionController = new SessionController('secret')
      expenseController = new ExpenseController(store, sessionController)
      reportController = new ExpenseReportsController(expenseController)
      done()
    })
  })

  beforeEach(function(){
    var promises = []
    for ( var i = 0; i < 10; ++i ){
      promises.push(expenseController.newUserExpense(createRequest({
        comment: ''
      , description: 'description'
      , amount: 1 + i
      , dateTime: DUMMY_DATE + days(i) // 2016-01-31 01:02:03 UTC + 1day * i
      })))
    }
    return Promise.all(promises)
  })

  afterEach(function(){
    return store.clearDatabase()
  })

  it('should be able to generate a weekly report with totals', function(){
    return expect(reportController.weeklyReport({ session: { userId: 1 }, params: { userId : 1 } })).to.be.fulfilled.and.then(function(response){
      expect(response.status).to.equal(200)
      expect(response.body).to.be.an('array')
      var report = response.body
      expect(report).to.eql([
        { year: 2016, week: 6, startDate: DUMMY_DATE + days(8), endDate: DUMMY_DATE + days(9), totalDays: 2, totalAmount: 9+10 }
      , { year: 2016, week: 5, startDate: DUMMY_DATE + days(1), endDate: DUMMY_DATE + days(7), totalDays: 7, totalAmount: 2+3+4+5+6+7+8 }
      , { year: 2016, week: 4, startDate: DUMMY_DATE          , endDate: DUMMY_DATE          , totalDays: 1, totalAmount: 1 }
      ])
    })
  })

  it('should reject with 401 if no session', function(){
    return expect(reportController.weeklyReport({ params: { userId : 1 } })).to.eventually.have.property('status', 401)
  })

  it('should reject with 401 if wrong user', function(){
    return expect(reportController.weeklyReport({ session: { userId: 2 }, params: { userId : 1 } })).to.eventually.have.property('status', 401)
  })

  it('should allow different user if admin role', function(){
    return expect(reportController.weeklyReport({ session: { userId: 2, role: 'admin' }, params: { userId : 1 } })).to.eventually.have.property('status', 200)
  })

})


function days(d){
  return d * 60*60*24
}

function createRequest(body){
  var req = {
    session : {
      userId: 1
    , role: 'user'
    }
  , params: {
      userId: 1
    }
  , body : body
  }
  return req
}
