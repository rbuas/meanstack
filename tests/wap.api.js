var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

global.ROOT_DIR = __dirname + "/..";

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var Memory = require(ROOT_DIR + "/brain/memory");
var TestRouteApi = require(ROOT_DIR + "/brain/testrouteapi");
var User = require(ROOT_DIR + "/models/user");

/////////////
// TESTCLASS : TestWapApi
///////

TestWapApi.extends( TestRouteApi );
function TestWapApi (options) {
    TestRouteApi.call(this, options);
}

TestWapApi.prototype.list = function (state, category, type, callback) {
    var self = this;
    var path = "/s/waps";
    if(state) path += "/" + state;
    if(category) path += "/" + category;
    if(type) path += "/" + type;
    self.request({path : path , method : "GET"}, callback);
}

TestWapApi.prototype.map = function (category, type, callback) {
    var self = this;
    category = category || "";
    type = type || "";
    var path = "/s/wapmap/{0}/{1}".format(category, type);
    self.request({path : path , method : "GET"}, callback);
}

TestWapApi.prototype.get = function (wapid, state, callback) {
    var self = this;
    category = category || "";
    state = state || "";
    var path = "/s/wap/{0}/{1}".format(wapid, state);
    self.request({path : path , method : "GET"}, callback);
}

TestWapApi.prototype.create = function (wap, callback) {
    var self = this;
    var path = "/s/wap-create";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.update = function (wap, callback) {
    var self = this;
    var path = "/s/wap-update";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.startedition = function (wap, callback) {
    var self = this;
    var path = "/s/wap-startedition";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.endedition = function (wap, callback) {
    var self = this;
    var path = "/s/wap-endedition";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.review = function (wap, callback) {
    var self = this;
    var path = "/s/wap-review";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.repprove = function (wap, callback) {
    var self = this;
    var path = "/s/wap-repprove";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.approve = function (wap, callback) {
    var self = this;
    var path = "/s/wap-approve";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

TestWapApi.prototype.publish = function (wap, callback) {
    var self = this;
    var path = "/s/wap-publish";
    self.request({path : path , method : "POST", data : {wap:wap}}, callback);
}

var verifySuccess = function (err, info, data) {
    _expect(err).to.be.null;
    _expect(info).to.be.ok;
    _expect(info.statusCode).to.be.equal(200);
    _expect(data).to.be.ok;
    _expect(data.success).to.be.equal(Wap.MESSAGE.WAP_SUCCESS);
}

var verifyWap = function (wap, expected) {
    expected = expected || {};
    _expect(wap).to.be.ok;
    if(expected.status) _expect(wap.status).to.be.equal(expected.status);
    if(expected.state) _expect(wap.state).to.be.equal(expected.state);
}

describe.only("api.wap", function() {
    var m, test;
    var usertest = {email : "usertest@test.com", password : "123456", forcestatus : User.STATUS.OFF};
    var testwaps = [
        {path:"home", content:["hello world"], type:"A", status:Wap.STATUS.PUBLIC, state:Wap.STATE.PUBLIC},
        {path:"history", content:["bla bla bla"], type:"B", status:Wap.STATUS.PUBLIC, state:Wap.STATE.DRAFT},
        {path:"aboutus", content:["nothing"], type:"A", status:Wap.STATUS.PUBLIC, state:Wap.STATE.PUBLIC},
        {path:"news", content:["running tests"], type:"B", status:Wap.STATUS.PUBLIC, state:Wap.STATE.PUBLIC},
        {path:"contact", content:["please don't"], type:"A", status:Wap.STATUS.PUBLIC, state:Wap.STATE.PUBLIC},
        {path:"page_a", content:["ohhhh"], type:"B", status:Wap.STATUS.PUBLIC, state:Wap.STATE.DRAFT},
        {path:"page_b", content:["ohhhh"], type:"A", status:Wap.STATUS.BLOCKED, state:Wap.STATE.SCHEDULED, publicdate : _moment().add(1, "days")},
        {path:"page_c", content:["ohhhh"], type:"C", status:Wap.STATUS.PUBLIC, state:Wap.STATE.EDITING, author: "editortest", publicdate : _moment().add(1, "days")},
        {path:"post_1", content:["hello world 1"], type:"A", status:Wap.STATUS.PUBLIC, state:Wap.STATE.PUBLIC},
        {path:"post_2", content:["hello world 2"], type:"B", status:Wap.STATUS.BLOCKED, state:Wap.STATE.EDITING, author: "editortest"},
        {path:"post_3", content:["hello world 3"], type:"C", status:Wap.STATUS.PUBLIC, state:Wap.STATE.SCHEDULED, publicdate : _moment().add(1, "days")}
    ];

    before(function(done) {
        m = new Memory({onconnect:function() {
            test = new TestWapApi({ urlbase : "localhost", port:8080, keepsession:true });
            User.Remove({}, function () {
                User.Create(usertest, function(err, savedUser) {
                    _expect(err).to.be.null;
                    _expect(savedUser).to.be.ok;
                    done();
                });
            });
        }});
    });

    after(function(done) {
        User.Remove({}, function() {
            m.disconnect(done);
        });
    });

    beforeEach(function(done) {
        test.request({
            path : "/s/user-login/", 
            method : "POST", 
            data : usertest
        }, function(err, info, data) {
            _expect(err).to.be.null;
            _expect(info).to.be.ok;
            _expect(info.statusCode).to.be.equal(200);
            _expect(data).to.be.ok;
            _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
            Wap.DRAFT.remove({}, function() {
                Wap.Remove({}, function() {
                    var pending = testwaps.length;
                    testwaps.forEach(function(wap, index, arr) {
                        Wap.Create(wap, usertest, function(err, savedWap) {
                            _expect(err).to.be.null;
                            if(--pending <= 0) done();
                        });
                    });
                });
            });
        });
    });

    afterEach(function(done) {

            Wap.Remove({}, function() {
                Wap.DRAFT.remove({}, done);
            });
    });

    describe("list", function() {

        it("basic", function(done) {
            test.list(null, null, null, function(err, info, data) {
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(Wap.MESSAGE.WAP_SUCCESS);
                _expect(data.waps).to.be.ok;
                _expect(data.waps.length).to.be.equal(11);
                _expect(data.waps[0].path).to.be.equal("home");
                _expect(data.waps[0].state).to.be.equal(Wap.STATE.PUBLIC);
                done();
            });
        });
    });

    describe("parcours", function() {
        it("newpage", function(done) {
            test.parcours(
                [
                    {
                        action:test.create, 
                        params:[{path:"newpage", content:["new page content 1"]}],
                        verify:function(err, info, data) {
                            verifySuccess(err, info, data);
                            verifyWap(data.wap, {
                                status : Wap.STATUS.BLOCKED,
                                state : Wap.STATE.DRAFT
                            });
                            return true;
                        }
                    }
                ], function(err, info, data) {
                    done();
                }
            );
        });

        it("editdraft", function(done) {
            test.parcours(
                [
                    {
                        action:test.create, 
                        params:[{path:"newpage", content:["new page content 1"]}],
                        verify:function(err, info, data) {
                            verifySuccess(err, info, data);
                            verifyWap(data.wap, {
                                status : Wap.STATUS.BLOCKED,
                                state : Wap.STATE.DRAFT
                            });
                            return true;
                        }
                    },
                    {
                        action:test.startedition, 
                        params:[{id:"newpage"}],
                        verify:function(err, info, data) {
                            verifySuccess(err, info, data);
                            verifyWap(data.wap, {
                                status : Wap.STATUS.BLOCKED,
                                state : Wap.STATE.DRAFT
                            });
                            return true;
                        }
                    }
                ], function(err, info, data) {
                    done();
                }
            );
        });

        it("publicpage", function(done) {
            test.parcours(
                [
                    {
                        action:test.create, 
                        params:[{path:"newpage", content:["new page content 1"]}],
                        verify:function(err, info, data) {
                            verifySuccess(err, info, data);
                            verifyWap(data.wap, {
                                status : Wap.STATUS.BLOCKED,
                                state : Wap.STATE.DRAFT
                            });
                            return true;
                        }
                    },
                    {
                        action:test.create, 
                        params:[{path:"newpage", content:["new page content 1"]}],
                        verify:function(err, info, data) {
                            verifySuccess(err, info, data);
                            verifyWap(data.wap, {
                                status : Wap.STATUS.BLOCKED,
                                state : Wap.STATE.DRAFT
                            });
                            return true;
                        }
                    }
                ], function(err, info, data) {
                    done();
                }
            );
        });

    });

});