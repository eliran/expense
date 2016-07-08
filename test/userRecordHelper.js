(function(context){
  context.userRecord = function(record){
    record = record || {}
    return { 
      id: record.id || 1
    , loginName: record.loginName || 'user@domain.com'
    , firstName: record.firstName || 'first'
    , lastName: record.lastName || 'last'
    , role: record.role || 'user'
    }
  }
})(window)