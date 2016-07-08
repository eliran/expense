(function(context){
  context.expenseRecord = function(record){
    record = record || {}
    return { 
      id: record.id || 1
    , amount: record.amount || 10015
    , comment: 'A comment'
    , description: 'Description'
    , dateTime: 123123123 
    }
  }
})(window)