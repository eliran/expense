module.exports = function(){
  this.validatesNotBlank = function(fieldName){
    return this.validates(fieldName, function(){
      var fieldValue = this[fieldName]
      if ( typeof fieldValue !== 'string' || fieldValue.trim().length === 0 ){
        this.errors.add(fieldName, 'field must not be blank')
        return false
      }
      return true
    })
  }

  this.hasMany('expenses')
  this.validatesFormatOf('loginName', 'email')
  this.validatesPresenceOf('firstName', 'lastName')
  this.validatesNotBlank('firstName')
  this.validatesNotBlank('lastName')
}
