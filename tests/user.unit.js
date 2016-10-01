var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var Memory = require("../brain/memory");
var User = require("../models/user");


describe("unit.user", function() {
    var _m;
    var _email = "rodrigobuas+unittest@gmail.com";
    var _password = "123456";

    before(function(done) {
        _m = new Memory({onconnect:done});
    });

    after(function(done){
        _m.disconnect(done);
    });

    describe("create", function() {
        afterEach(function(done) {
            User.Remove({email: _email}, function() {
                done();
            });
        });

        it("null", function(done) {
            var user = null;
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.equal(null);
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("empty", function(done) {
            var user = {};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.equal(null);
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("nopassword", function(done) {
            var user = {email: _email};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.equal(null);
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("success", function(done) {
            var user = {email: _email, password: _password};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.status).to.equal(User.USERSTATUS.CONFIRM);
                done();
            });
        });
        it("duplicate", function(done) {
            var user = {email: _email, password: _password};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.status).to.equal(User.USERSTATUS.CONFIRM);
                User.Create(user, function(err2, savedUser2) {
                    _expect(err2).to.not.equal(null);
                    _expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
        it("type-name", function(done) {
            var user = {
                email: _email, 
                password:_password ,
                name : 555
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.status).to.equal(User.USERSTATUS.CONFIRM);
                done();
            });
        });
        it("type-genre-ko", function(done) {
            var user = {
                email: _email, 
                password: _password,
                gender : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.equal(null);
                done();
            });
        });
        it("type-genre-ok", function(done) {
            var user = {
                email: _email, 
                password: _password,
                gender : User.USERGENDER.F
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.equal(null);
                done();
            });
        });
        it("type-profile-ko", function(done) {
            var user = {
                email: _email, 
                password: _password,
                profile : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.equal(null);
                done();
            });
        });
        it("type-profile-ok", function(done) {
            var user = {
                email: _email, 
                password: _password,
                profile : User.USERPROFILE.ADMIN
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.equal(null);
                done();
            });
        });
    });

    describe("createanonymous", function() {
        after(function(done) {
            User.PurgeAnonymous(0, done);
        });

        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.status).to.equal(User.USERSTATUS.ANONYMOUS);
                done();
            });
        });
        it("multiple", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.status).to.equal(User.USERSTATUS.ANONYMOUS);
                User.CreateAnonymous(function(err2, savedUser2) {
                    _expect(err2).to.equal(null);
                    _expect(savedUser2).to.not.equal(null);
                    _expect(savedUser2.status).to.equal(User.USERSTATUS.ANONYMOUS);
                    User.CreateAnonymous(function(err3, savedUser3) {
                        _expect(err3).to.equal(null);
                        _expect(savedUser3).to.not.equal(null);
                        _expect(savedUser3.status).to.equal(User.USERSTATUS.ANONYMOUS);
                        done();
                    });
                });
            });
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.id).to.not.equal(null);
                User.Find({_id: savedUser.id}, function(err2, users) {
                    _expect(err2).to.equal(null);
                    _expect(users).to.not.equal(null);
                    _expect(users.length).to.equal(1);
                    User.Remove({_id: savedUser.id}, function() {
                        User.Find({id: savedUser.id}, function(err2, users) {
                            _expect(err2).to.equal(null);
                            _expect(users).to.not.equal(null);
                            _expect(users.length).to.equal(0);
                            done();
                        });
                    });
                });
            });
        });
        it("notfound", function(done) {
            User.Find({email: _email}, function(err, users) {
                _expect(err).to.equal(null);
                _expect(users).to.not.equal(null);
                _expect(users.length).to.equal(0);
                User.Remove({email: _email}, function(err2) {
                    _expect(err2).to.equal(null);
                    done();
                });
            });
        });
    });

    describe("update", function() {
    });

    describe("login", function() {
    });

    describe("logout", function() {
    });

    describe("list", function() {
    });

    describe("purgeanonymous", function() {
    });
});