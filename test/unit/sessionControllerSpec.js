var helpers = require('../helpers')
  , expect = helpers.expect
  , SessionController = require('../../lib/sessionController')

describe('Session Controller', function(){
  it('should be created with a secret', function(){
    expect(new SessionController('secret')).to.be.ok
  })

  it('should throw if no secret provided', function(){
    expect(function(){ new SessionController() }).to.throw()
  })

  describe('instance', function(){
    beforeEach(function(){
      this.sessionController = new SessionController('secret')
    })

    it('#create returns session token', function(){
      return expect(this.sessionController.create({})).to.eventually.be.a('string')
    })

    describe('active session', function(){
      beforeEach(function(){
        var self = this
        this.sessionState = {param1: 'value', param2: 2}
        return this.sessionController.create(this.sessionState).then(function(session){
          self.activeSession = session
        })
      })

      it('#verify returns session\'s data', function(){
        var sessionState = this.sessionState
        return expect(this.sessionController.verify(this.activeSession)).to.be.fulfilled.then(function(state){
          expect(state).to.shallowDeepEqual(sessionState)
          expect(state).to.have.property('iat')
        })
      })
    })
  })

})
