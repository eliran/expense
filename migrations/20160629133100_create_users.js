module.exports = function(){
  this.createTable('users', function(){
    this.string('loginName', {not_null: true, unique: true})
    this.string('firstName', {not_null: true})
    this.string('lastName',{not_null: true})
    this.string('role',{not_null: true})
    this.string('epassword', {not_null: true})
  });
}
