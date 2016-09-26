var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _log = require("../brain/log");

var User = require("../models/user");

describe("user-unit-create", function() {
    before(function() {
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
        var user =  {email:"rodrigobuas+unittest@gmail.com"};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-success", function(done) {
        var user =  {email:"rodrigobuas+unittest@gmail.com", password:"123456"};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
            _expect(savedUser).to.equal(true);
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