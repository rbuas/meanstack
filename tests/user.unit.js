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
        var user = null;
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-empty", function(done) {
        var user = {};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-nopassword", function(done) {
        var user = {email:utest.email};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            _expect(err.code).to.equal("USER_PARAMS");
            _expect(savedUser).to.equal(false);
            done();
        });
    });
    it("create-user-success", function(done) {
        var user = {email:utest.email, password:utest.password};
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
            _expect(savedUser).to.not.equal(null);
            _expect(savedUser.status).to.equal(User.USERSTATUS.CONFIRM);
            done();
        });
    });
    it("create-user-duplicate", function(done) {
        var user = {email:utest.email, password:utest.password};
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
    it("create-user-type-name", function(done) {
        var user = {
            email:utest.email, 
            password:utest.password,
            name : 555
        };
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
            _expect(savedUser).to.not.equal(null);
            _expect(savedUser.status).to.equal(User.USERSTATUS.CONFIRM);
            done();
        });
    });
    it("create-user-type-genre-ko", function(done) {
        var user = {
            email:utest.email, 
            password:utest.password,
            gender : "HHH"
        };
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            done();
        });
    });
    it("create-user-type-genre-ok", function(done) {
        var user = {
            email:utest.email, 
            password:utest.password,
            gender : User.USERGENDER.F
        };
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
            done();
        });
    });
    it("create-user-type-profile-ko", function(done) {
        var user = {
            email:utest.email, 
            password:utest.password,
            profile : "HHH"
        };
        User.Create(user, function(err, savedUser) {
            _expect(err).to.not.equal(null);
            done();
        });
    });
    it("create-user-type-profile-ok", function(done) {
        var user = {
            email:utest.email, 
            password:utest.password,
            profile : User.USERPROFILE.ADMIN
        };
        User.Create(user, function(err, savedUser) {
            _expect(err).to.equal(null);
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