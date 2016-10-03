var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var Memory = require("../brain/memory");
var User = require("../models/user");


describe("unit.user", function() {
    var m;
    var email1 = "rodrigobuas+unittest@gmail.com";
    var email2 = "rodrigobuas+unittest2@gmail.com";
    var email3 = "rodrigobuas+unittest3@gmail.com";
    var email4 = "rodrigobuas+unittest4@gmail.com";
    var _password = "123456";

    before(function(done) {
        m = new Memory({onconnect:done});
    });

    after(function(done){
        m.disconnect(done);
    });

    describe("create", function() {
        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                done();
            });
        });

        it("null", function(done) {
            var user = null;
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("empty", function(done) {
            var user = {};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("nopassword", function(done) {
            var user = {email: email1};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal("USER_PARAMS");
                _expect(savedUser).to.equal(false);
                done();
            });
        });
        it("success", function(done) {
            var user = {email: email1, password: _password};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                done();
            });
        });
        it("duplicate", function(done) {
            var user = {email: email1, password: _password};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                User.Create(user, function(err2, savedUser2) {
                    _expect(err2).to.not.be.null;
                    _expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
        it("type-name", function(done) {
            var user = {
                email: email1, 
                password:_password ,
                name : 555
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                done();
            });
        });
        it("type-genre-ko", function(done) {
            var user = {
                email: email1, 
                password: _password,
                gender : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.be.null;
                done();
            });
        });
        it("type-genre-ok", function(done) {
            var user = {
                email: email1, 
                password: _password,
                gender : User.GENDER.F
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                done();
            });
        });
        it("type-profile-ko", function(done) {
            var user = {
                email: email1, 
                password: _password,
                profile : "HHH"
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.not.be.null;
                done();
            });
        });
        it("type-profile-ok", function(done) {
            var user = {
                email: email1, 
                password: _password,
                profile : User.PROFILE.ADMIN
            };
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                done();
            });
        });
    });

    describe("createanonymous", function() {
        after(function(done) {
            User.Purge(0, User.STATUS.ANONYMOUS, done);
        });

        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                done();
            });
        });
        it("multiple", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                User.CreateAnonymous(function(err2, savedUser2) {
                    _expect(err2).to.be.null;
                    _expect(savedUser2).to.not.be.null;
                    _expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                    User.CreateAnonymous(function(err3, savedUser3) {
                        _expect(err3).to.be.null;
                        _expect(savedUser3).to.not.be.null;
                        _expect(savedUser3.status).to.equal(User.STATUS.ANONYMOUS);
                        done();
                    });
                });
            });
        });
    });

    describe("purge", function() {
        var dateMinus0 = _moment();
        var dateMinus10 = _moment().subtract(10, "days");
        var dateMinus30 = _moment().subtract(30, "days");
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a",
                    forcestatus : User.STATUS.ANONYMOUS,
                    since : dateMinus10
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                    _expect(savedUser.email).to.equal(email1);
                    _expect(dateMinus10.isSame(savedUser.since)).to.equal(true);
                    User.Create({
                        email : email2,
                        password : "a",
                        forcestatus : User.STATUS.ANONYMOUS,
                        since : dateMinus30
                    },
                    function(err2, savedUser2) {
                            _expect(err2).to.be.null;
                            _expect(savedUser2).to.not.be.null;
                            _expect(savedUser2.email).to.equal(email2);
                            _expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                            _expect(dateMinus30.isSame(savedUser2.since)).to.equal(true);
                            User.Create({
                                    email : email3,
                                    password : "a",
                                    forcestatus : User.STATUS.ANONYMOUS,
                                },
                                function(err3, savedUser3) {
                                    _expect(err3).to.be.null;
                                    _expect(savedUser3).to.not.be.null;
                                    _expect(savedUser3.email).to.equal(email3);
                                    _expect(savedUser3.status).to.equal(User.STATUS.ANONYMOUS);
                                    User.Create({
                                            email : email4,
                                            password : "a",
                                            forcestatus : User.STATUS.CONFIRM,
                                            since : dateMinus10
                                        },
                                        function(err4, savedUser4) {
                                            _expect(err4).to.be.null;
                                            _expect(savedUser4).to.not.be.null;
                                            _expect(savedUser4.email).to.equal(email4);
                                            _expect(savedUser4.status).to.equal(User.STATUS.CONFIRM);
                                            _expect(dateMinus10.isSame(savedUser.since)).to.equal(true);
                                            done();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                User.Remove({email: email2}, function() {
                    User.Remove({email: email3}, function() {
                        User.Remove({email: email4}, function() {
                            done();
                        });
                    });
                });
            });
        });

        it("days-0-anonymous", function(done) {
            User.Purge(0, User.STATUS.ANONYMOUS, function(err) {
                _expect(err).to.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.not.be.null;
                    _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                    _expect(user).to.be.null;
                    User.Get(email2, function(err, user) {
                        _expect(err).to.not.be.null;
                        _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        _expect(user).to.be.null;
                        User.Get(email3, function(err, user) {
                            _expect(err).to.not.be.null;
                            _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                            _expect(user).to.be.null;
                            User.Get(email4, function(err, user4) {
                                _expect(err).to.be.null;
                                _expect(user4).to.not.be.null;
                                _expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-10-anonymous", function(done) {
            User.Purge(10, User.STATUS.ANONYMOUS, function(err) {
                _expect(err).to.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.not.be.null;
                    _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                    _expect(user).to.be.null;
                    User.Get(email2, function(err, user) {
                        _expect(err).to.not.be.null;
                        _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        _expect(user).to.be.null;
                        User.Get(email3, function(err, user3) {
                            _expect(err).to.be.null;
                            _expect(user3).to.not.be.null;
                            _expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                _expect(err).to.be.null;
                                _expect(user4).to.not.be.null;
                                _expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-10-confirm", function(done) {
            User.Purge(10, User.STATUS.CONFIRM, function(err) {
                _expect(err).to.be.null;
                User.Get(email1, function(err, user1) {
                    _expect(err).to.be.null;
                    _expect(user1).to.not.be.null;
                    _expect(user1.email).to.equal(email1);
                    User.Get(email2, function(err, user2) {
                        _expect(err).to.be.null;
                        _expect(user2).to.not.be.null;
                        _expect(user2.email).to.equal(email2);
                        User.Get(email3, function(err, user3) {
                            _expect(err).to.be.null;
                            _expect(user3).to.not.be.null;
                            _expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                _expect(err).to.not.be.null;
                                _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                                _expect(user4).to.be.null;
                                done();
                            });
                        });
                    });
                });
            })
        });

        it("days-30-anonymous", function(done) {
            User.Purge(30, User.STATUS.ANONYMOUS, function(err) {
                _expect(err).to.be.null;
                User.Get(email1, function(err, user1) {
                    _expect(err).to.be.null;
                    _expect(user1).to.not.be.null;
                    _expect(user1.email).to.equal(email1);
                    User.Get(email2, function(err, user2) {
                        _expect(err).to.not.be.null;
                        _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                        _expect(user2).to.be.null;
                        User.Get(email3, function(err, user3) {
                            _expect(err).to.be.null;
                            _expect(user3).to.not.be.null;
                            _expect(user3.email).to.equal(email3);
                            User.Get(email4, function(err, user4) {
                                _expect(err).to.be.null;
                                _expect(user4).to.not.be.null;
                                _expect(user4.email).to.equal(email4);
                                done();
                            });
                        });
                    });
                });
            })
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            User.CreateAnonymous(function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.id).to.not.be.null;
                User.Find({_id: savedUser.id}, function(err2, users) {
                    _expect(err2).to.be.null;
                    _expect(users).to.not.be.null;
                    _expect(users.length).to.equal(1);
                    User.Remove({_id: savedUser.id}, function() {
                        User.Find({id: savedUser.id}, function(err2, users) {
                            _expect(err2).to.be.null;
                            _expect(users).to.not.be.null;
                            _expect(users.length).to.equal(0);
                            done();
                        });
                    });
                });
            });
        });
        it("notfound", function(done) {
            User.Find({email: email1}, function(err, users) {
                _expect(err).to.be.null;
                _expect(users).to.not.be.null;
                _expect(users.length).to.equal(0);
                User.Remove({email: email1}, function(err2) {
                    _expect(err2).to.be.null;
                    done();
                });
            });
        });
    });

    describe("update", function() {
        beforeEach(function (done) {
            User.Create({
                email: email1, 
                password: _password,
                name: "a",
                label: "b",
                birthday: new Date(),
                gender:User.GENDER.M,
                profile:User.PROFILE.WRITER,
                origin:"rbuas sa",
                lang:"br"
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                done();
            });
        });
        afterEach(function(done) {
            User.Remove({email:email1}, function() {
                User.Remove({email:email2}, done);
            });
        })

        it("name", function(done) {
            User.Update({
                email: email1,
                name: "aa"
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.name).to.equal("aa");
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.name).to.equal("aa");
                    done();
                })
            });
        });

        it("label", function(done) {
            User.Update({
                email: email1,
                label: "bb"
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.label).to.equal("bb");
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.label).to.equal("bb");
                    done();
                })
            });
        });

        it("birthday", function(done) {
            User.Update({
                email: email1,
                birthday: new Date(1982,0,1,21,45)
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    var birthday = user.birthday;
                    _expect(birthday).to.not.be.null;
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
                email: email1,
                status: User.STATUS.BLOCK
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.equal(User.STATUS.BLOCK);
                    done();
                })
            });
        });

        it("status-ko", function(done) {
            User.Update({
                email: email1,
                status: "STATUS NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.not.equal("STATUS NOT VALID");
                    done();
                })
            });
        });

        it("gender-ok", function(done) {
            User.Update({
                email: email1,
                gender: User.GENDER.F
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.gender).to.equal(User.GENDER.F);
                    done();
                })
            });
        });

        it("gender-ko", function(done) {
            User.Update({
                email: email1,
                gender: "GENDER NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.status).to.not.equal("GENDER NOT VALID");
                    done();
                })
            });
        });

        it("profile-ok", function(done) {
            User.Update({
                email: email1,
                profile: User.PROFILE.ADMIN
            }, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.profile).to.equal(User.PROFILE.ADMIN);
                    done();
                })
            });
        });

        it("profile-ko", function(done) {
            User.Update({
                email: email1,
                profile: "PROFILE NOT VALID"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.profile).to.not.equal("PROFILE NOT VALID");
                    done();
                })
            });
        });

        it("origin", function(done) {
            User.Update({
                email: email1,
                origin: "RBUAS CO"
            }, function(err, savedUser) {
                User.Get(email1, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.origin).to.equal("RBUAS CO");
                    done();
                })
            });
        });

        it("email", function(done) {
            User.Update({
                email: email1,
                newemail: email2
            }, function(err, savedUser) {
                User.Get(email2, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.email).to.equal(email2);
                    _expect(user.status).to.equal(User.STATUS.CONFIRM);
                    done();
                })
            });
        });

        it("email-trystatus", function(done) {
            User.Update({
                email: email1,
                newemail: email2,
                status:User.STATUS.ON
            }, function(err, savedUser) {
                User.Get(email2, function(err, user) {
                    _expect(err).to.be.null;
                    _expect(user).to.not.be.null;
                    _expect(user.email).to.equal(email2);
                    _expect(user.status).to.equal(User.STATUS.CONFIRM);
                    done();
                })
            });
        });
    });

    describe("get", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a"
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("found", function(done) {
            User.Get(email1, function(err, user) {
                _expect(err).to.be.null;
                _expect(user).to.not.be.null;
                _expect(user.email).to.equal(email1);
                done();
            });
        });

        it("notfound", function(done) {
            User.Get(email2, function(err, user) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_NOTFOUND);
                done();
            });
        });

        it("missingparams", function(done) {
            User.Get(null, function(err, user) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

    });

    describe("find", function() {
        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : "a",
                    forcestatus : User.STATUS.ANONYMOUS
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.status).to.equal(User.STATUS.ANONYMOUS);
                    _expect(savedUser.email).to.equal(email1);
                    User.Create({
                        email : email2,
                        password : "a",
                        forcestatus : User.STATUS.ANONYMOUS
                    },
                    function(err2, savedUser2) {
                            _expect(err2).to.be.null;
                            _expect(savedUser2).to.not.be.null;
                            _expect(savedUser2.email).to.equal(email2);
                            _expect(savedUser2.status).to.equal(User.STATUS.ANONYMOUS);
                            User.Create({
                                    email : email3,
                                    password : "a",
                                    forcestatus : User.STATUS.CONFIRM
                                },
                                function(err3, savedUser3) {
                                    _expect(err3).to.be.null;
                                    _expect(savedUser3).to.not.be.null;
                                    _expect(savedUser3.email).to.equal(email3);
                                    _expect(savedUser3.status).to.equal(User.STATUS.CONFIRM);
                                    done();
                                }
                            );
                        }
                    );
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, function() {
                User.Remove({email: email2}, function() {
                    User.Remove({email: email3}, done);
                });
            });
        });

        it("found", function(done) {
            User.Find({email:email1}, function(err, users) {
                _expect(err).to.be.null;
                _expect(users).to.not.be.null;
                _expect(users.length).to.equal(1);
                _expect(users[0].email).to.equal(email1);
                done();
            });
        });

        it("notfound", function(done) {
            User.Find({email:email4}, function(err, users) {
                _expect(err).to.be.null;
                _expect(users).to.not.be.null;
                _expect(users.length).to.equal(0);
                done();
            });
        });

        it("multiples", function(done) {
            User.Find({status : User.STATUS.ANONYMOUS}, function(err, users) {
                _expect(err).to.be.null;
                _expect(users).to.not.be.null;
                _expect(users.length).to.be.at.least(2);
                done();
            });
        });

        it("all", function(done) {
            User.Find({}, function(err, users) {
                _expect(err).to.be.null;
                _expect(users).to.not.be.null;
                _expect(users.length).to.be.at.least(3);
                done();
            });
        });
    });




    describe("login", function() {
    });

    describe("logout", function() {
    });
});