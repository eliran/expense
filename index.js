var swaggerReader = require('./lib/swaggerReader')
  , RestifyHttpProvider = require('./lib/restifyHttpProvider')
  , Router = require('./lib/Router')
  , UserController = require('./lib/UserController')
  , ExpenseController = require('./lib/ExpenseController')
  , SessionController = require('./lib/SessionController')
  , DataStore = require('./lib/dataStore')
  , logger = require('./logger')
  , SPEC_FILE = __dirname + '/api.yml'
  , SECRET_KEY = 'abcdefg'

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
    console.log('Server started at port ' + port)
  })

  function allowUserManagerForRole(role){
    sessionController.allowOperationForRole(role, 'setRole')
    sessionController.allowOperationForRole(role, 'manageUsers')
  }
})

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
