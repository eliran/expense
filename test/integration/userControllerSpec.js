'use strict'

var helpers = require('../helpers')
  , expect = helpers.expect
  , store = helpers.store
  , Promise = helpers.Promise
  , safePassword = helpers.safePassword
  , UserController = helpers.UserController
  , SessionController = helpers.SessionController
  , FAKE_USER_PASSWORD = '12345678'

describe('User Controller', function(){
  var userController
  beforeEach(function(done){
    store.ready(function(){
      var sessionController = new SessionController('secret')
      sessionController.allowOperationForRole('admin', 'setRole')
      userController = new UserController(store, sessionController)
      done()
    })
  })

  afterEach(function(){
    return store.clearDatabase()
  })

  beforeEach(function(){
    this.testUser = {
      loginName: 'name@email.com'
    , firstName: 'name'
    , lastName: 'last'
    , password: '12345678'
    , role: 'admin'
    }
  })

  describe('creating a new user', function(){
    it('should be created when valid', function(){
      var testUser = this.testUser
      return expect(userController.newUser({ body: testUser })).to.be.fulfilled.then(function(response){
        delete testUser.password
        expect(response.status).to.equal(201)
        expect(response.body).to.eql({
          role: 'user'
        , id: response.body.id
        , firstName: testUser.firstName
        , loginName: testUser.loginName
        , lastName: testUser.lastName
        })
      })
    })

    it('should allow creating a user with role when eleveated role are logged in', function(){
      var testUser = this.testUser
      return expect(userController.newUser({ session: { role: 'admin' }, body: testUser })).to.be.fulfilled.then(function(response){
        expect(response.status).to.equal(201)
        expect(response.body).to.have.property('role', 'admin')
      })
    })

    it('should encrypt passwords', function(){
      var mock = this.sinon.mock(safePassword)
      mock.expects('pencrypt').once().withArgs(this.testUser.password).returns(new Promise('xxx'))
      userController.newUser({ body: this.testUser })
      mock.verify()
    })

    it('should report error if encryption of password fails', function(){
      this.sinon.stub(safePassword, 'pencrypt').returns(Promise.fcall(function(){ throw new Error('Error') }))
      return expect(userController.newUser({ body: this.testUser })).to.be.fulfilled.then(function(response){
        expect(response).to.eql({
          status: 500
        , body: {
            code: 'InternalError'
          , message: 'Error'
          }
        })
      })
    })

    it('should reject non email loginName', function(){
      this.testUser.loginName = 'name'
      return expectCreateUserToFail(this.testUser, 'errors.loginName[0]', 'not a valid format')
    })

    it('should reject user with no firstName', function(){
      delete this.testUser.firstName
      return expectCreateUserToFail(this.testUser, 'errors.firstName[0]', 'not valid')
    })

    it('should reject user with blank firstName', function(){
      this.testUser.firstName = '    '
      return expectCreateUserToFail(this.testUser, 'errors.firstName[0]', 'field must not be blank')
    })

    it('should reject user with no lastName', function(){
      delete this.testUser.lastName
      return expectCreateUserToFail(this.testUser, 'errors.lastName[0]', 'not valid')
    })

    it('should reject user with blank lastName', function(){
      this.testUser.lastName = '    '
      return expectCreateUserToFail(this.testUser, 'errors.lastName[0]', 'field must not be blank')
    })

    it('should reject passwords that are less than 8 characters long', function(){
      this.testUser.password = '1234567'
      return expectCreateUserToFail(this.testUser, 'errors.password[0]', 'password is too short')
    })
  
    it('should reject blank passwords', function(){
      this.testUser.password = '                        '
      return expectCreateUserToFail(this.testUser, 'errors.password[0]', 'password is too short')
    })

    it('should reject unknown roles', function(){
      this.testUser.role = 'unknown'
      return expectCreateUserToFail(this.testUser, 'errors.role[0]', 'unknown role')
    })

    function expectCreateUserToFail(user, errorProperty, errorValue){
      return expectToFail(userController.newUser({ body: user }), errorProperty, errorValue)
    }

  })

  describe('list users', function(){
    beforeEach(function(){
      return fixtureCreateUsers(10)
    })

    it('should return all users', function(){
      return expect(userController.findUsers()).to.be.fulfilled.then(function(response){
        var users = response.body
        expect(response.status).to.equal(200)
        expect(users).to.have.length(10 + 1) // Admin is always there
        expect(users[0]).to.have.keys('id', 'loginName', 'firstName', 'lastName', 'role')
      })
    })
  })

  describe('when having a user in database', function(){
    var userJSON
    beforeEach(function(){
      return createTempUser().then(function(user){ userJSON = user })
    })

    it('should not allow creating a user with same loginName', function(){
      return expect(userController.newUser({
        body: { 
          loginName: userJSON.loginName
        , firstName: 'other'
        , lastName: 'other'
        , password: '12345678' 
        }
      })).to.become({
        status: 400
      , body: {
          code: 'AlreadyExists'
        , message: 'Login name in use'
        }
      })
    })

    describe('login user', function(){
      it('should be rejected with password mismatch', function(){
        return expect(userController.loginUser({ body: { loginName: userJSON.loginName, password: 'wrongPassword' } })).to.become({
          status: 401
        , body: {
            code: 'Unauthorized'
          , message: 'User or password mismatch'
          }
        })
      })

      it('should reject if no such user', function(){
        return expect(userController.loginUser({ body: { loginName: 'unknownUser', password: 'wrongPassword' } })).to.become({
          status: 401
        , body: {
            code: 'Unauthorized'
          , message: 'User or password mismatch'
          }
        })
      })

      it('should return a token if login succeed', function(){
        var loginBody = { body: { loginName: userJSON.loginName, password: FAKE_USER_PASSWORD } }
        return expect(userController.loginUser(loginBody)).to.be.fulfilled.then(function(response){
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('token')
        })
      })
    })

    describe('get user', function(){
      it('should return a specific user', function(){
        return expect(userController.getUser({ params: { id : userJSON.id } })).to.eventually.have.property('body').eql(userJSON)
      })

      it('should fail if no such user', function(){
        return expect(userController.getUser({ params: { id : userJSON.id+1 } })).to.become({
          status: 400
        , body: {
            code: 'Failed'
          , message: 'no such user'
          }
        })
      })
    })
  
    describe('update user', function(){
      it('should update an existing user', function(){
        return expect(userController.updateUser({ params: { id: userJSON.id }, body: {lastName: 'other', role: 'admin'}})).to.become({
          status: 200
        , body: {
            id: userJSON.id
          , firstName: userJSON.firstName
          , lastName: 'other'
          , loginName: userJSON.loginName
          , role: 'user'
          }
        })
      })

      it('should update role of user when session have an elevented role', function(){
        var testUser = this.testUser
        return expect(userController.updateUser({ session: { role: 'admin' }, params: { id: userJSON.id }, body: {role: 'admin'}})).to.be.fulfilled.then(function(response){
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('role', 'admin')
        })
      })

      it('should validate role before update', function(){
        return expect(userController.updateUser({ params: { id: userJSON.id }, body: {role: 'unknown'}})).to.become({
          status: 400
        , body: {
            code: 'UnknownRole'
          , message: 'Unknown role'
          }
        })
      })

      it('should fail if no such user', function(){
        return expect(userController.updateUser({ params: { id: userJSON.id+1 }, body: {lastName: 'other'}})).to.become({
          status: 400
        , body: {
            code: 'Failed'
          , message: 'no such user'
          }
        })
      })

      it('should fail if new values are invalid', function(){
        return expectToFail(userController.updateUser({ params: { id: userJSON.id }, body: {lastName: ''} }), 'errors.lastName[0]', 'field must not be blank')
      })
    })

    describe('delete user', function(){
      it('should delete specific user', function(){
        return expect(userController.deleteUser({ params: { id: userJSON.id } })).to.eventually.have.property('status', 204)
      })
    })
  })
 
  function expectToFail(promise, errorProperty, errorValue){
    return expect(promise).to.be.fulfilled.then(function(value){
      expect(value.status).to.equal(400)
      expect(value.body).to.have.deep.property(errorProperty, errorValue)
    }) 
  }
  
  var autoIncrementIndex = 1
  function createTempUser(salt){
    var useSalt = salt || autoIncrementIndex++
    return userController.newUser({
      body: {
        loginName: 'user' + useSalt + '@name.com'
      , firstName: 'user-' + useSalt
      , lastName: 'lastName'
      , password: FAKE_USER_PASSWORD
      }
    }).then(function(response){
      return response.body
    })
  }

  function fixtureCreateUsers(count){
    var promises = []
    for ( var i = 0; i < count; ++i ){
      promises.push(createTempUser(i+1))
    }
    return Promise.all(promises)
  }

})