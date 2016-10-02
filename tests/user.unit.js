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
    var _email2 = "rodrigobuas+unittest2@gmail.com";
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
        beforeEach(function (done) {
            User.Create({
                email: _email, 
                password: _password,
                name: "a",
                label: "b",
                birthday: new Date(),
                gender:User.USERGENDER.M,
                profile:User.USERPROFILE.WRITER,
                origin:"rbuas sa",
                lang:"br"
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                done();
            });
        });
        afterEach(function(done) {
            User.Remove({email:_email}, done);
        })

        it("name", function(done) {
            User.Update({
                email: _email,
                name: "aa"
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.name).to.equal("aa");
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.name).to.equal("aa");
                    done();
                })
            });
        });

        it("label", function(done) {
            User.Update({
                email: _email,
                label: "bb"
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                _expect(savedUser.label).to.equal("bb");
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.label).to.equal("bb");
                    done();
                })
            });
        });

        it("birthday", function(done) {
            User.Update({
                email: _email,
                birthday: new Date(1982,0,1,21,45)
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    var birthday = user.birthday;
                    _expect(birthday).to.not.equal(null);
                    _expect(birthday.getFullYear()).to.equal(1982);
                    _expect(birthday.getMonth()).to.equal(0);
                    _expect(birthday.getDate()).to.equal(1);
                    _expect(birthday.getHours()).to.equal(21);
                    _expect(birthday.getMinutes()).to.equal(45);
                    done();
                })
            });
        });

        it("status-ok", function(done) {
            User.Update({
                email: _email,
                status: User.USERSTATUS.BLOCK
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.status).to.equal(User.USERSTATUS.BLOCK);
                    done();
                })
            });
        });

        it("status-ko", function(done) {
            User.Update({
                email: _email,
                status: "STATUS NOT VALID"
            }, function(err, savedUser) {
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.status).to.not.equal("STATUS NOT VALID");
                    done();
                })
            });
        });

        it("gender-ok", function(done) {
            User.Update({
                email: _email,
                gender: User.USERGENDER.F
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.gender).to.equal(User.USERGENDER.F);
                    done();
                })
            });
        });

        it("gender-ko", function(done) {
            User.Update({
                email: _email,
                gender: "GENDER NOT VALID"
            }, function(err, savedUser) {
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.status).to.not.equal("GENDER NOT VALID");
                    done();
                })
            });
        });

        it("profile-ok", function(done) {
            User.Update({
                email: _email,
                profile: User.USERPROFILE.ADMIN
            }, function(err, savedUser) {
                _expect(err).to.equal(null);
                _expect(savedUser).to.not.equal(null);
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.profile).to.equal(User.USERPROFILE.ADMIN);
                    done();
                })
            });
        });

        it("profile-ko", function(done) {
            User.Update({
                email: _email,
                profile: "PROFILE NOT VALID"
            }, function(err, savedUser) {
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.profile).to.not.equal("PROFILE NOT VALID");
                    done();
                })
            });
        });

        it("origin", function(done) {
            User.Update({
                email: _email,
                origin: "RBUAS CO"
            }, function(err, savedUser) {
                User.Get(_email, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.origin).to.equal("RBUAS CO");
                    done();
                })
            });
        });

        it("email", function(done) {
            User.Update({
                email: _email,
                newemail: _email2
            }, function(err, savedUser) {
                User.Get(_email2, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.email).to.equal(_email2);
                    done();
                })
            });
        });

        it("email-forcestatus", function(done) {
            User.Update({
                email: _email,
                newemail: _email2,
                status:User.USERSTATUS.ON
            }, function(err, savedUser) {
                User.Get(_email2, function(err, user) {
                    _expect(err).to.equal(null);
                    _expect(user).to.not.equal(null);
                    _expect(user.email).to.equal(_email2);
                    _expect(user.status).to.equal(User.USERSTATUS.CONFIRM);
                    done();
                })
            });
        });
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