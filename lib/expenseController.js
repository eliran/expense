'use strict'
var Response = require('./response')
  , Promise = require('q')
  , moment = require('moment')

module.exports = class ExpenseController {
  constructor(store, sessionController){
    this.store = store
    this.sessionController = sessionController
    this.Expense = store.Model('expense')
    if ( !this.Expense ) throw 'Expense Model not defined'
  }

  newUserExpense(req){
    if ( !this.allowedAccess(req) ) return Promise.resolve(Response.unauthorized())
    var Expense = this.Expense
      , newExpense = req.body
      , expense = new Expense({
          'user_id': parseInt(req.params.userId)
        , comment: newExpense.comment
        , description: newExpense.description
        , amount: newExpense.amount
        , dateTime: dateTimeToQuery(newExpense.dateTime)
        })
    return expense.save(function(saved){
      return saved ? Response.created(prepareExpenseRecord(expense)) : Response.errors(expense.errors)
    })
  }

  updateUserExpense(req){
    var id = parseInt(req.params.id)
      , changes = req.body
    if ( !this.allowedAccess(req) || !id || ('user_id' in changes) ) return Promise.resolve(Response.unauthorized())
    return this.Expense.find(id).exec().then(function(expense){
      if ( !expense ) return noSuchExpense()
      expense.set(changes)
      return expense.save(function(saved){
        return saved ? Response.ok(prepareExpenseRecord(expense)) : Response.errors(expense.errors)
      })
    })
  }

  getUserExpense(req){
    var id = parseInt(req.params.id)
    if ( !this.allowedAccess(req) || !id ) return Promise.resolve(Response.unauthorized())
    return this.Expense.find(id).exec().then(function(expense){
      return expense ? Response.ok(prepareExpenseRecord(expense)) : noSuchExpense()
    })
  }

  deleteUserExpense(req){
    var id = parseInt(req.params.id)
    if ( !this.allowedAccess(req) || !id ) return Promise.resolve(Response.unauthorized())
    return this.Expense.where({ id: id }).delete().then(function(){
      return Response.ok()
    })
  }

  getUserExpenses(req){
    if ( !this.allowedAccess(req) ) return Promise.resolve(Response.unauthorized())

    var userId = parseInt(req.params.userId)
      , filter = req.query || {}
      , query = this.Expense.where({ 'user_id': userId })
    if ( filter.startDate ) query = query.where({ 'dateTime_gte': dateTimeToQuery(filter.startDate) })
    if ( filter.endDate ) query = query.where({ 'dateTime_lte': dateTimeToQuery(filter.endDate) })
    if ( filter.query ) query = query.where({ 'description_like': filter.query })
    if ( filter.limit ) query = query.limit(parseInt(filter.limit))
    if ( filter.offset ) query = query.offset(parseInt(filter.offset))
    return query.order('dateTime', true).exec().then(function(expenses){
      return Response.ok({
        expenses: expenses.map(function(expense){
          return prepareExpenseRecord(expense)
        })
      })
    })
  }

  allowedAccess(req){
    req = req || {}
    var session = req.session || {}
      , params = req.params || {}
    return session.userId === params.userId || session.role === 'admin'
  }
}

function dateTimeToQuery(dateTime){
  return moment(dateTime * 1000).toDate()
}

function prepareExpenseRecord(record){
  return {
    id: record.id
  , comment: record.comment
  , description: record.description
  , amount: record.amount
  , dateTime: parseInt(new Date(record.dateTime).getTime() / 1000)
  }
}

function noSuchExpense(){
  return Response.error('Failed', 'no record')
}
                   