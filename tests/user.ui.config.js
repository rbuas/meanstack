exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['user.ui.js'],
    jasmineNodeOpts: {
       showColors: true,
       defaultTimeoutInterval: 30000,
       isVerbose: true
    }
}