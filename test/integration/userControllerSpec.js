'use strict'

var helpers = require('../helpers')
  , expect = helpers.expect
  , store = helpers.store
  , Promise = helpers.Promise
  , safePassword = helpers.safePassword
  , UserController = require('../../lib/userController')

describe('User Controller', function(){
  var userController
  beforeEach(function(done){
    store.ready(function(){
      userController = new UserController(store)
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
    }
  })

  describe('creating a new user', function(){
    it('should be created when valid', function(){
      var testUser = this.testUser
      return expect(userController.newUser({ body: testUser })).to.be.fulfilled.then(function(response){
        delete testUser.password
        expect(response.status).to.equal(201)
        expect(response.body).to.shallowDeepEqual(testUser)
        expect(response.body).to.have.property('role', 'user')
        expect(response.body).to.have.property('id')
      })
    })

    it('should encrypt passwords', function(){
      var mock = this.sinon.mock(safePassword)
      mock.expects('encrypt').once().withArgs(this.testUser.password)
      userController.newUser({ body: this.testUser })
      mock.verify()
    })

    it('should report error if encryption of password fails', function(){
      this.sinon.stub(safePassword, 'encrypt', function(password, callback){
        return callback(null, 'Error')
      })
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
        expect(users).to.have.length(10)
        expect(users[0]).to.have.keys('id', 'loginName', 'firstName', 'lastName', 'role')
      })
    })
  })

  describe('get user', function(){
    var userJSON
    beforeEach(function(){
      return createTempUser().then(function(user){ userJSON = user })
    })

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
    var userJSON
    beforeEach(function(){
      return createTempUser().then(function(user){ userJSON = user })
    })

    it('should update an existing user', function(){
      return expect(userController.updateUser({ params: { id: userJSON.id }, body: {lastName: 'other'}})).to.be.become({
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

    it('should fail if no such user', function(){
      return expect(userController.updateUser({ params: { id: userJSON.id+1 }, body: {lastName: 'other'}})).to.be.become({
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
    var userJSON
    beforeEach(function(){
      return createTempUser().then(function(user){ userJSON = user })
    })

    it('should delete specific user', function(){
      return expect(userController.deleteUser({ params: { id: userJSON.id } })).to.eventually.have.property('status', 204)
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
      , password: '12345678'
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