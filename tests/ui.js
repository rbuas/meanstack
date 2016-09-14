var _selenium = require('selenium-webdriver');
var _by = require('selenium-webdriver').By;
var _until = require('selenium-webdriver').until;
var _chrome = require('selenium-webdriver/chrome');
var _firefox = require('selenium-webdriver/firefox');
var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _log = require("../brain/log");

describe("user-e2e", function() {

    before(function(done) {
        this.driver = new _selenium.Builder()
                      .withCapabilities(_selenium.Capabilities.chrome())
                      .usingServer('http://localhost:4444/wd/hub')
                      .build();

        this.driver.get("http://www.techinsight.io/").then(done);
    });

    after(function(done) {
        this.driver.quit().then(done);
    });

    it("ui google base", function(done) {
        this.timeout(20 * 1000);

        var element = this.driver.findElement(_by.tagName('body'));

        element.getAttribute('id').then(function(id) {
            _expect(id).to.contain('home');
            done();
        });
    });

    it('Has a working nav', function(done) {
        var element = this.driver.findElement(_by.linkText('REVIEW'));

        element.click();

        this.driver.getCurrentUrl().then(function(value) {
            _expect(value).to.contain('/review');
            done();
        });
    });
});