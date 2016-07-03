var helpers = require('../helpers')
  , expect = helpers.expect
  , safePassword = require('../../lib/safePassword')

describe('Password hasher', function(){
  it('it returns an hash for password', function(done){
     safePassword.encrypt('1234', function(encryptedPassword, err){
       expect(err).to.not.be.ok
       expect(encryptedPassword).to.not.equal('1234')
       expect(encryptedPassword).to.have.length.of.at.least(48)
       expect(encryptedPassword.substring(0,6)).to.have.equal('$2a$10')
       done()
     })
  })

  it('can verify password', function(done){
    safePassword.encrypt('1234', function(encryptedPassword){
      safePassword.verify('1234', encryptedPassword, function(valid){
        expect(valid).to.be.true
        done()
      })
    })
  })

  it('reject invalid password', function(done){
    safePassword.encrypt('1234', function(encryptedPassword){
      safePassword.verify('12345', encryptedPassword, function(valid){
        expect(valid).to.be.false
        done()
      })
    })
  })
})
