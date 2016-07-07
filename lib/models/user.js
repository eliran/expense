var validatesNotBlank = require('../validatesNotBlank')

module.exports = function(){
  this.hasMany('expenses')
  this.validatesFormatOf('loginName', 'email')
  this.validatesPresenceOf('firstName', 'lastName')
  validatesNotBlank.call(this, 'firstName')
  validatesNotBlank.call(this, 'lastName')
}
