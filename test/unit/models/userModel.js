var helpers = require('../../helpers')
  , safePassword = require('../../../lib/safePassword')
  , expect = helpers.expect
  , store = helpers.store
  , adminPassword = 'adminPassword'

describe('User Model', function(){
  beforeEach(function(){
    this.User = store.Model('user')
  })

  it('should exist', function(){
    expect(this.User).to.be.ok
  })

  describe('Admin user', function(){
    beforeEach(function(){
      var self = this
      return this.User.where({role: 'admin'}).limit(1).exec(function(adminUser){
        self.adminUser = adminUser
      })
    })

    it('should exists', function(){
      return expect(this.adminUser).to.be.ok
    })

    it('should have a valid password', function(){
      return expect(safePassword.pverify(adminPassword, this.adminUser.epassword)).to.eventually.be.true
    })
  })
  
})
