exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['user-e2e.js'],
    jasmineNodeOpts: {
       showColors: true,
       defaultTimeoutInterval: 30000,
       isVerbose: true
    }
}