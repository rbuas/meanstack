var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var Memory = require("../brain/memory");
var WebMailer = require("../brain/webmailer");
var User = require("../models/user");

Dictionary.load(__dirname + "/../common.json");
WebMailer.fake(true);

describe("unit.user", function() {
    var m;
    var email1 = "rodrigobuas+unittest@gmail.com";
    var email2 = "rodrigobuas+unittest2@gmail.com";
    var email3 = "rodrigobuas+unittest3@gmail.com";
    var email4 = "rodrigobuas+unittest4@gmail.com";
    var password = "123456";

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
            var user = {email: email1, password: password};
            User.Create(user, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                done();
            });
        });
        it("duplicate", function(done) {
            var user = {email: email1, password: password};
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
                password: password ,
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
                password: password,
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
                password: password,
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
                password: password,
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
                password: password,
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
                password: password,
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

    describe("confirm", function() {
        var userid;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    _expect(savedUser.status).to.equal(User.STATUS.CONFIRM);
                    userid = savedUser.id;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingparams", function(done) {
            User.Confirm(null, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                _expect(savedUser).to.be.null;
                done();
            });
        });

        it("success", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.OFF);
                done();
            });
        });
    });

    describe("getresettoken", function() {
        var usertoken;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    usertoken = savedUser.password;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.GetResetToken(null, function(err, token) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                _expect(token).to.be.null;
                done();
            });
        });

        it("success", function(done) {
            User.GetResetToken(email1, function(err, token) {
                _expect(err).to.be.null;
                _expect(token).to.not.be.null;
                _expect(usertoken).to.equal(token);
                done();
            });
        });
    });

    describe("resetpassword", function() {
        var usertoken;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    User.GetResetToken(email1, function(err, token) {
                        _expect(err).to.be.null;
                        _expect(token).to.not.be.null;
                        usertoken = token;
                        done();
                    });
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.ResetPassword(null, usertoken, "123456", function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missingusertoken", function(done) {
            User.ResetPassword(email1, null, "123456", function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missinguserpassword", function(done) {
            User.ResetPassword(email1, usertoken, null, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("success", function(done) {
            User.ResetPassword(email1, usertoken, "123456", function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.password).to.not.be.null;
                _expect(savedUser.password).to.not.be.equal(usertoken);
                done();
            });
        });
    });

    describe("login", function() {
        var userid;

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    userid = savedUser.id;
                    done();
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.Login(null, password, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("missingpassword", function(done) {
            User.Login(email1, null, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("confirm", function(done) {
            User.Login(email1, password, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_CONFIRMATION);
                done();
            });
        });

        it("password-ok", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.OFF);
                User.Login(email1, password, function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.status).to.equal(User.STATUS.ON);
                    done();
                });
            });
        });

        it("password-ko", function(done) {
            User.Confirm(userid, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).to.equal(User.STATUS.OFF);
                User.Login(email1, password + "dsqsdqs", function(err, savedUser) {
                    _expect(err).to.not.be.null;
                    _expect(err.code).to.equal(User.ERROR.USER_WRONG_PASSWORD);
                    done();
                });
            });
        });
    });

    describe("logout", function() {

        beforeEach(function(done) {
            User.Create({
                    email : email1,
                    password : password
                },
                function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.email).to.equal(email1);
                    User.Confirm(savedUser.id, function(err, savedUser) {
                        _expect(err).to.be.null;
                        _expect(savedUser).to.not.be.null;
                        _expect(savedUser.status).to.equal(User.STATUS.OFF);
                        User.Login(email1, password, function(err, savedUser) {
                            _expect(err).to.be.null;
                            _expect(savedUser).to.not.be.null;
                            _expect(savedUser.status).to.equal(User.STATUS.ON);
                            done();
                        });
                    });
                }
            );
        });

        afterEach(function(done) {
            User.Remove({email: email1}, done);
        });

        it("missingemail", function(done) {
            User.Logout(null, function(err, savedUser) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(User.ERROR.USER_PARAMS);
                done();
            });
        });

        it("success", function(done) {
            User.Logout(email1, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).equal(User.STATUS.OFF);
                done();
            });
        });

        it("alreadyout", function(done) {
            User.Logout(email1, function(err, savedUser) {
                _expect(err).to.be.null;
                _expect(savedUser).to.not.be.null;
                _expect(savedUser.status).equal(User.STATUS.OFF);
                User.Logout(email1, function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.not.be.null;
                    _expect(savedUser.status).equal(User.STATUS.OFF);
                    done();
                });
            });
        });

    });
});