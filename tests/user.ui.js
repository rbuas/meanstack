// var _selenium = require('selenium-webdriver');
// var _by = require('selenium-webdriver').By;
// var _until = require('selenium-webdriver').until;
// var _chrome = require('selenium-webdriver/chrome');
// var _firefox = require('selenium-webdriver/firefox');
var _fs = require("fs");
var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _log = require("../brain/log");
require("../brain/base");
var TestProofCase = require("../brain/testproofcase").TestProofCase;


/////////////
// TESTCLASS : TestUserPages
///////

TestUserPages.extends( TestProofCase );
function TestUserPages (tcase) {
    TestProofCase.call(this, tcase, { path : __dirname + "/proof/" });

    // private

    var _buttonLogin = element(by.css('[ng-click="uc.login()"]'));
    var _buttonRegister = element(by.css('[ng-click="uc.register()"]'));
    var _emailInput = element(by.model("uc.email"));
    var _passwordInput = element(by.model("uc.password"));
    var _loginError = element(by.binding("uc.loginerror"));
    var _userMessage = element(by.binding("uc.usermessage"));


    // public 

    this.start = function() {
        browser.get("http://localhost:8080/").then(function() {
            browser.waitForAngular();
        });
    }

    this.reset = function() {
        browser.manage().deleteAllCookies();
        //browser.get("http://localhost:8080/s/reset");
    }

    this.email = function(email) {
        if(email == undefined)
            return _emailInput.getAttribute("value"); 
        _emailInput.clear();
        return _emailInput.sendKeys(email);
    }

    this.password = function(password) {
        if(password == undefined)
            return _passwordInput.getAttribute("value");
        _passwordInput.clear();
        return _passwordInput.sendKeys(password);
    }

    this.clickLogin = function() {
        return _buttonLogin.click();
    }

    this.clickRegister = function() {
        return _buttonRegister.click();
    }

    this.loginError = function() {
        return _loginError.getText();
    }

    this.userMessage = function() {
        return _userMessage.getText();
    }
}



/////////////
// TESTPROOFCASE : login
///////

describe("user-e2e-login", function() {
    var tc = new TestUserPages(this);

    beforeAll(function() {
    });

    beforeEach(function() {
        tc.start();
    });

    afterEach(function() {
        tc.reset();
    });

    afterAll(function() {
        tc.saveLog();
        expect(tc.diffCount()).toEqual(0);
    });

    it("should load the page", function(done) {
        try {
            expect(tc.email()).toEqual("");
            tc.proof("login-pristine")
            .then(function() {
                done();
            });
        } catch(err) {
            tc.log("login-pristine", "ERROR");
        }
    });
    it("empty fields - should not login", function(done) {
        tc.clickLogin();
        tc.proof("login-missingemail")
        .then(function() {
            done();
        });
    });
    it("should fill email field", function(done) {
        tc.email("rodrigo@buas.com");
        tc.email()
        .then(function(email) {
            expect(email).toEqual("rodrigo@buas.com");
        })
        .then(function() {
            tc.proof("login-emailfilled")
            .then(function() {
                done();
            });
        });
    });
    it("should fill login form", function(done) {
        tc.email("rodrigo@buas.com");
        tc.password("123456");
        tc.email()
        .then(function(email) {
            expect(email).toEqual("rodrigo@buas.com");
        })
        .then(function() {
            tc.password()
            .then(function(password) {
                expect(password).toEqual("123456");
            })
            .then(function() {
                tc.proof("login-formfilled")
                .then(function() {
                    done();
                });
            });
        });
    });
    it("should fail login with wrong password", function(done) {
        tc.email("rodrigo@buas.com");
        tc.password("xxxxx");
        tc.clickLogin();
        browser.waitForAngular();
        tc.loginError()
        .then(function(error) {
            expect(error).toEqual("ERROR_LOGIN");
            tc.proof("login-loginfail")
            .then(function() {
                done();
            });
        });
    });
    it("should success login", function(done) {
        tc.email("rodrigo@buas.com");
        tc.password("123456");
        tc.clickLogin();
        browser.waitForAngular();
        tc.loginError()
        .then(function(error) {
            expect(error).toEqual("");
            tc.userMessage()
            .then(function(message) {
                expect(message).toEqual("LOGIN_SUCCESSFUL");
            });
            tc.proof("login-loginsuccess")
            .then(function() {
                done();
            });
        });
    });
});



/////////////
// TESTPROOFCASE : register
///////

describe("user-e2e-register", function() {
    var tc = new TestUserPages(this);

    beforeAll(function() {
    });

    beforeEach(function() {
        tc.start();
    });

    afterEach(function() {
        tc.reset();
    });

    afterAll(function() {
        tc.saveLog();
        expect(tc.diffCount()).toEqual(0);
    });

    it("should go to register page", function(done) {
        //tc.clickRegister();
        tc.proof("login-register-pristine")
        .then(function() {
            done();
        });
    });
});
