var Web = require('./web')
  , webServer = new Web()

webServer.start(process.env.PORT || 3000)
