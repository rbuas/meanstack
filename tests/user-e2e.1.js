var _selenium = require('selenium-webdriver');
var _by = require('selenium-webdriver').By;
var _until = require('selenium-webdriver').until;
var _chrome = require('selenium-webdriver/chrome');
var _firefox = require('selenium-webdriver/firefox');
var _fs = require("fs");
var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _log = require("../brain/log");

function testConfig (testit, timeout, width, height) {
    if(!testit || !testit.driver)
        return;

    timeout = timeout || 1;
    testit.timeout(timeout * 1000);
}

function testProof (testit, proofname) {
    if(!testit || !testit.driver)
        return;

    proofname = proofname ? "." + proofname : "";
    var title = testit.test ? testit.test.fullTitle() : "";
    title = title.replace(/ /g, "-");
    var filename = __dirname + '/proof/' + title + proofname + ".png";

    testit.driver.takeScreenshot().then(function(data) {
        _fs.writeFileSync(filename, data, 'base64');
    });
}

describe("user-e2e-login", function() {

    before(function(done) {
        this.driver = new _selenium.Builder()
                      .withCapabilities(_selenium.Capabilities.chrome())
                      .usingServer('http://localhost:4444/wd/hub')
                      .build();

        this.driver.get("http://localhost:8080/").then(done);
    });

    after(function(done) {
        this.driver.quit().then(done);
    });

    it("start", function(done) {
        testConfig(this, 20);
        testProof(this);
        var element = this.driver.findElement(_by.tagName('body'));
        element.getAttribute('class').then(function(className) {
            _expect(className).to.contain('ng-scope');
            done();
        });
    });

    it("submit invalid form", function(done) {
        var testit = this;
        testConfig(testit, 20);
        testProof(testit);

        testit.driver.sleep(2000).then(function() {
            var body = testit.driver.findElement(_by.tagName('body'));
            testit.driver.findElement(_by.css("button[ng-click='uc.login()']"))
                .then(function(button) {
                    button.click();
                    testProof(testit, "afterclick");
                    done();
                })
                .thenCatch(function(){
                    console.log("errroorrororor");
                    done();
                });

        });
            // this.driver.then(function(className) {
            //     _expect(className).to.contain('ng-scope');
            //     done();
            // });
    });

    // it("wrong password", function(done) {
    //     testConfig(this, 20);
    //     testProof(this);
    //     var element = this.driver.findElement(_by.tagName('body'));
    //     element.getAttribute('class').then(function(className) {
    //         _expect(className).to.contain('ng-scope');
    //         done();
    //     });
    // });
});