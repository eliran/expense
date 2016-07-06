var helpers = require('../../helpers')
  , expect = helpers.expect
  , store = helpers.store

describe('Expense Model', function(){
  beforeEach(function(){
    this.expense = store.Model('expense')
  })

  it('should exist', function(){
    expect(this.expense).to.be.ok
  })
})
