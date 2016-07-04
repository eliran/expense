exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub'
, baseUrl: 'http://localhost:3000'
, capabilities: {
    browserName: 'chrome'
  }
, specs: [ 'e2e/*Spec.js' ]
, framework: 'mocha'
}
