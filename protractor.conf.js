exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub'
, baseUrl: 'http://localhost:3000'
, capabilities: {
    browserName: 'chrome'
  , loggingPrefs: {
      browser: 'ALL'
    }
  }
, specs: [ 'integration/*Spec.js' ]
, framework: 'mocha'
, mochaOpts: {
  reporter: "spec",
}

}
