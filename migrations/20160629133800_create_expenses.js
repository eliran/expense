module.exports = function(){
  this.createTable('expenses', function(){
    this.integer('user_id', {not_null: true})
    this.datetime('dateTime', {not_null: true})
    this.integer('amount',{not_null: true})
    this.string('description', {default: ''})
    this.string('comment', {default: ''})
  });
}
