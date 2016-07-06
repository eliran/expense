var helpers = require('../helpers')
  , expect = helpers.expect
  , DataStore = require('../../lib/dataStore')

describe('Data store', function(){
   
  it('#readConfigFile should return JSON config', function(){
     expect(readConfig()).to.have.keys('$common','development', 'production', 'default')
  })

  function readConfig(){
    return DataStore.readConfigFile(configFileName())
  }
  function configFileName(){
    return __dirname + '/testConfig.json'
  }

  it('#parseConfig: returns default config if no env specified', function(){
    expect(DataStore.parseConfig(readConfig())).to.eql({
      key: 'default'
    , common: 'common'
    })
  })
 
  it('#parseConfig: returns default config if unknown env specified', function(){
    expect(DataStore.parseConfig(readConfig()), 'someEnv').to.eql({
      key: 'default'
    , common: 'common'
    })
  })

  it('#parseConfig: returns selected env', function(){
    expect(DataStore.parseConfig(readConfig(), 'development')).to.eql({
      key: 'dev'
    , common: 'common'
    })
  })
 
  it('#praseConfig: returns config values of $keys expend from object param', function(){
    expect(DataStore.parseConfig(readConfig(), 'production', { NODE_ENV: 'fromEnv' }, '/test')).to.eql({
      'var': 'fromEnv'
    , other: 'NODE_ENV'
    , expendPath:'/test/file'
    , common: 'common'
    })
  })

  it('#getConfig: expends path relative to config file path', function(){
    expect(DataStore.getConfig(configFileName(), 'production')).to.have.property('expendPath', __dirname + '/file')
  })

  it('#getConfig(string): loads a file with development env', function(){
    expect(DataStore.getConfig(configFileName())).to.eql({
      key: 'dev'
    , common: 'common'
    })
  })

  it('#getConfig(string, env): loads a file with env', function(){
    expect(DataStore.getConfig(configFileName(), 'default')).to.eql({
      key: 'default'
    , common: 'common'
    })
  })

  it('#getConfig(object, env): processes object as config', function(){
    expect(DataStore.getConfig({env: { key: 'value' }}, 'env')).to.eql({
      key: 'value'
    })
  })

  it('dataStore can be created with config', function(){
    var dataStore = new DataStore(configFileName(), 'development')
    expect(dataStore.config).to.eql({
      key: 'dev'
    , common: 'common'
    })
  })

  describe('instance', function(){
    beforeEach(function(){
      this.dataStore = new DataStore()
    })

    it('should initially have no store', function(){
       expect(this.dataStore.store).to.be.null
    })

    it('should get a store from ready callback', function(done){
       this.dataStore.ready(function(err, store){
         expect(store).to.not.be.null
         done()
       })
    })

    it('should get a store from #getStore', function(){
      expect(this.dataStore.getStore()).to.not.be.null
    })
  })
})
