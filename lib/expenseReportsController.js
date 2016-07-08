'use strict'
var Response = require('./response')
  , Promise = require('q')

module.exports = class ExpenseReportsController {
  constructor(expenseController){
    this.expenseController = expenseController
    if ( !this.expenseController ) throw 'Expense Controller not defined'
    this.Expense = expenseController.Expense
  }

  weeklyReport(req){
    var expenseController = this.expenseController
    if ( !expenseController.allowedAccess(req) ) return Promise.resolve(Response.unauthorized())

    return this.Expense
      .select('YEAR(`dateTime`) as `year`')
      .select('WEEK(`dateTime`) as `week`')
      .select('MIN(`dateTime`) as `startDate`')
      .select('MAX(`dateTime`) as `endDate`')
      .select('COUNT(DISTINCT DAY(`dateTime`)) as `totalDays`')
      .select('SUM(`amount`) as `amount`')
      .group('year', 'week')
      .order([ 'year', 'week' ], true)
      .exec().then(function(report){
      return Promise.resolve(Response.ok(report.map(function(entry){
        return {
          startDate: expenseController.dateTimeToUnix(entry.startDate)
        , endDate: expenseController.dateTimeToUnix(entry.endDate)
        , totalDays: entry.totalDays
        , totalAmount: entry.amount
        , week: entry.week
        , year: entry.year
        }
      })))
    })
  }

}
