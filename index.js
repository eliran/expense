var swaggerReader = require('./lib/swaggerReader')
  , RestifyHttpProvider = require('./lib/restifyHttpProvider')
  , Router = require('./lib/router')
  , UserController = require('./lib/userController')
  , ExpenseController = require('./lib/expenseController')
  , SessionController = require('./lib/sessionController')
  , DataStore = require('./lib/dataStore')
  , logger = require('./logger')
  , SPEC_FILE = __dirname + '/api.yml'
  , SALT_ROUNDS = 10

getSecretKey(function(SECRET_KEY){
  connectDatabase(function(store){
    var sessionController = new SessionController(SECRET_KEY)
      , userController = new UserController(store, sessionController)
      , expenseController = new ExpenseController(store, sessionController)
      , apiSpec = swaggerReader(SPEC_FILE)
      , port = process.env.PORT || apiSpec.hostPort

    sessionController.registerRoles([ 'admin', 'manager', 'user' ])
    allowUserManagerForRole('admin')
    allowUserManagerForRole('manager')

    createServerWithSpecification(apiSpec, [ userController , expenseController ], sessionController).listen(port, function(){
      console.log('REST Server started at port ' + port)
    })

    function allowUserManagerForRole(role){
      sessionController.allowOperationForRole(role, 'setRole')
      sessionController.allowOperationForRole(role, 'manageUsers')
    }
  })
})

function getSecretKey(callback){
  if ( !process.env.SECRET_KEY ) {
    var bcrypt = require('bcrypt')
    bcrypt.genSalt(SALT_ROUNDS,function(err, salt){
      if ( err ) throw err
      console.log('!! SECRET_KEY = [ ' + salt + ' ] !! Pass this in the environment to keep tokens valid between server restarts')
      callback(salt)
    })
  }
  else callback(process.env.SECRET_KEY)
}

function connectDatabase(ready){
  var dataStore = new DataStore(__dirname + '/database.json')
  dataStore.ready(function(err, store){
    if ( typeof ready === 'function' ) ready(store)
  })
}

function createServerWithSpecification(spec, controllers, sessionController){
  var server = new RestifyHttpProvider(logger.defaultLogger)
    , router = new Router(server, sessionController)
  router.addRoutes(spec.paths, controllers)
  return server
}
