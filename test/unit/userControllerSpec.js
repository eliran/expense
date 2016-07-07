var helpers = require('../helpers')
  , expect = helpers.expect
  , Promise = helpers.Promise
  , UserController = helpers.UserController
  , SessionController = helpers.SessionController

describe('User Controller: Unit', function(){
  beforeEach(function(){
    var mockStore = {
      Model: function(){ return {} }
    }
    this.sessionController = new SessionController('secret')
    this.userController = new UserController(mockStore, this.sessionController)
    this.mockSessionController = this.sinon.mock(this.sessionController)
  })

  it('should invoke sessionController#create with userId & role', function(){
    this.mockSessionController.expects('create').withArgs({userId: 123, role: 'a-role'}).returns(Promise.fcall(function(){ return 'xxx'}))
    this.userController.createSession({ id: 123, role: 'a-role'})
    this.mockSessionController.verify()
  })

  it('#createSession should return token when successful', function(){
    this.mockSessionController.expects('create').returns(Promise.fcall(function(){ return 'xxx'}))
    return expect(this.userController.createSession({ id: 123, role: 'a-role', loginName: 'l', firstName: 'f', lastName: 'l' })).to.become({
      status: 200
    , body: {
        token: 'xxx'
      , role: 'a-role'
      , id: 123
      , loginName: 'l'
      , firstName: 'f'
      , lastName: 'l'
      }
    })
  })


  it('#createSession should return internalError if failed', function(){
    this.mockSessionController.expects('create').returns(Promise.fcall(function(){ throw new Error('failed')}))
    return expect(this.userController.createSession(123, 'a-role')).to.become({
      status: 500
    , body: {
        code: 'InternalError'
      , message: 'failed'
      }
    })
  })
})
