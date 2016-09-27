var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");

require("../brain/jsext");
var _log = require("../brain/log");
var Memory = require("../brain/memory");

function UTestUser () {
    var self = this;
    self.email = "rodrigobuas+unittest@gmail.com";
    self.password = "123456";

    self.start = function () {
        self.memory = new Memory();
        self.User = require("../models/user");
        
        return self.User;
    }

    self.clean = function() {
        self.User.Remove({email:self.email}, function(err) {
            if(err)
                console.log("error when clean user ", self.email);
        });
    }

    self.end = function() {
        self.clean();
        self.memory.disconnect();
    }
}

describe("user-unit-create", function() {
    var User;
    var utest = new UTestUser();

    before(function(done) {
        User = utest.start();
        done();
    });

    beforeEach(function(done) {
        utest.clean();
        done();
    });

    after(function(done) {
        utest.end();
        done();
    });

    it("create-user-null", function(done) {
        var user =  null;
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-empty", function(done) {
        var user =  {};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-nopassword", function(done) {
        var user =  {email:utest.email};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-success", function(done) {
        var user =  {email:utest.email, password:utest.password};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
            _expect(savedUser).to.not.equal(null);
            _expect(savedUser.status).to.equal("CONFIRM");
            done();
        });
    });
});

describe("user-unit-update", function() {
});

describe("user-unit-remove", function() {
});

describe("user-unit-login", function() {
});

describe("user-unit-logout", function() {
});

describe("user-unit-list", function() {
});