'use strict'
var Response = require('./response')
  , Promise = require('q')

module.exports = class ExpenseReportsController {
  constructor(expenseController){
    this.expenseController = expenseController
    if ( !this.expenseController ) throw 'Expense Controller not defined'
    this.Expense = expenseController.Expense
    this.escapeChar = expenseController.store.type === 'postgres' ? '"' : '`'
  }

  weeklyReport(req){
    var expenseController = this.expenseController
    if ( !expenseController.allowedAccess(req) ) return Promise.resolve(Response.unauthorized())

    var query = this.weeklyReportQuery()
    if ( !query ) return Promise.resolve(Response.internalError())

    return query.exec().then(function(report){
      return Promise.resolve(Response.ok(report.map(function(entry){
        return {
          startDate: expenseController.dateTimeToUnix(entry['start_date'])
        , endDate: expenseController.dateTimeToUnix(entry['end_date'])
        , totalDays: entry['total_days']
        , totalAmount: entry.amount
        , week: entry.week
        , year: entry.year
        }
      })))
    }, function(error){ console.log(error) })
  }

  weeklyReportQuery(){
    var dateTime = this.escapeColumnName('dateTime')
    return this.Expense
      .select('extract(year from ' + dateTime + ') as year')
      .select('extract(week from ' + dateTime + ') as week')
      .select('MIN(' + dateTime + ') as start_date')
      .select('MAX(' + dateTime + ') as end_date')
      .select('COUNT(DISTINCT extract(day from ' + dateTime + ')) as total_days')
      .select('SUM(amount) as amount')
      .group('year', 'week')
      .order([ 'year', 'week' ], true)
  }

  escapeColumnName(column){
    return this.escapeChar + column + this.escapeChar
  }
}
