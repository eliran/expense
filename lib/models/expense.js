var validatesNotBlank = require('../validatesNotBlank')

module.exports = function(){
  this.belongsTo('user')
  this.validatesNumericalityOf('amount', { gt: 0 })
  validatesNotBlank.call(this, 'description')
}
