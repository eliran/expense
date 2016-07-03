var helpers = require('../helpers')
  , expect = helpers.expect
  , safePassword = require('../../lib/safePassword')

describe('Password hasher', function(){
  it('it returns an hash for password', function(done){
     safePassword.encrypt('1234', function(err, encryptedPassword){
       expect(err).to.not.be.ok
       expect(encryptedPassword).to.not.equal('1234')
       expect(encryptedPassword).to.have.length.of.at.least(48)
       expect(encryptedPassword.substring(0,6)).to.equal('$2a$10')
       done()
     })
  })

  it('#pencrypt returns a promise', function(){
     return expect(safePassword.pencrypt('1234')).to.be.fulfilled.then(function(encrypted){
       expect(encrypted.substring(0,6)).to.equal('$2a$10')
     })
  })

  describe('with an encrypted password', function(){
    beforeEach(function(){
      var context = this
      return safePassword.pencrypt('1234').then(function(encrypted){
        context.encryptedPassword = encrypted
      })
    })

    it('#verify can verify password', function(done){
      safePassword.verify('1234', this.encryptedPassword, function(err, valid){
        expect(valid).to.be.true
        done()
      })
    })

    it('#verify reject invalid password', function(done){
      safePassword.verify('12345', this.encryptedPassword, function(err, valid){
        expect(valid).to.be.false
        done()
      })
    })

    it('#pverify can verify password returns a promise', function(){
      return expect(safePassword.pverify('1234', this.encryptedPassword)).to.eventually.be.true
    })

    it('#pverify reject invalid password', function(){
      return expect(safePassword.pverify('12345', this.encryptedPassword)).to.eventually.be.false
    })
  })
})
