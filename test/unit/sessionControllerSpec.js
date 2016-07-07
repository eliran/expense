var helpers = require('../helpers')
  , expect = helpers.expect
  , SessionController = helpers.SessionController

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

    describe('#operationAllowed', function(){
      it('returns true if an operation allowed with associated request', function(){
        this.sessionController.setAllowOperationForRole('role', 'doSomething', true)
        expect(this.sessionController.operationAllowed('doSomething', { role: 'role' })).to.be.true
      })
      it('returns false if an operation disallowed with associated request', function(){
        this.sessionController.setAllowOperationForRole('role', 'doSomething', false)
        expect(this.sessionController.operationAllowed('doSomething', { role: 'role' })).to.be.false
      })
      it('if no role provided it defaults to user', function(){
        this.sessionController.setAllowOperationForRole('user', 'doSomething', true)
        expect(this.sessionController.operationAllowed('doSomething')).to.be.true
      })

      it('if operation is not defined it defaults to false', function(){
        expect(this.sessionController.operationAllowed('doSomething')).to.be.false
      })

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
