var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

global.ROOT_DIR = __dirname + "/..";

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var Memory = require(ROOT_DIR + "/brain/memory");
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var ViewEngine = require(ROOT_DIR + "/brain/viewengine");
var Wap = require(ROOT_DIR + "/models/wap");

describe("unit.wap", function() {
    var m;
    var testwaps = [
        {path:"home", content:["hello world"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"history", content:["bla bla bla"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"aboutus", content:["nothing"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"news", content:["running tests"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"contact", content:["please don't"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"page_a", content:["ohhhh"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.DEV},
        {path:"page_b", content:["ohhhh"], status:Wap.STATUS.BLOCKED, state:Wap.STATE.TEST},
        {path:"page_c", content:["ohhhh"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.EDITION},
        {path:"post_1", content:["hello world 1"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.PUBLIC},
        {path:"post_2", content:["hello world 2"], status:Wap.STATUS.BLOCKED, state:Wap.STATE.EDITION},
        {path:"post_3", content:["hello world 3"], status:Wap.STATUS.ACTIVE, state:Wap.STATE.TEST}
    ];

    before(function(done) {
        m = new Memory({onconnect:function() {
            var pending = testwaps.length;
            testwaps.forEach(function(wap, index, arr){
                wap.id = "wap" + index;
                Wap.Create(wap, function(err, savedWap) {
                    _expect(err).to.be.null;
                    if(--pending <= 0) done();
                });
            });
        }});
    });

    after(function(done){
        Wap.Remove({}, function(){
            m.disconnect(done);
        });
    });

    describe("create", function() {
        afterEach(function(done) {
            Wap.Remove({id: "test"}, done);
        });

        it("null", function(done) {
            Wap.Create(null, function(err, savedWap) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });
        it("empty", function(done) {
            Wap.Create({}, function(err, savedWap) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });
        it("success", function(done) {
            Wap.Create({content:["test content"], id:"test"}, function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.id).to.be.equal("test");
                done();
            });
        });
        it("duplicate", function(done) {
            var doc = {content:"test content", id:"test"};
            Wap.Create(doc, function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                Wap.Create(doc, function(err2, savedWap2) {
                    _expect(err2).to.not.be.null;
                    _expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            Wap.Remove({id: "wap10"}, function(err) {
                _expect(err).to.be.null;
                Wap.Find({id: "wap10"}, function(err, waps) {
                    _expect(err).to.be.null;
                    _expect(waps).to.not.be.null;
                    _expect(waps.length).to.equal(0);
                    testwaps.splice(10,1)
                    done();
                });
            });
        });
        it("notfound", function(done) {
            Wap.Find({id: "wapnotfound"}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(0);
                Wap.Remove({id: "docnotfound"}, function(err) {
                    _expect(err).to.be.null;
                    done();
                });
            });
        });
    });

    describe("update", function() {
        it("content", function(done) {
            Wap.Update({
                id:"wap1",
                content: ["changed content", "test2", "test3"]
            }, function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.content).to.be.ok;
                _expect(savedWap.content.length).to.be.equal(3);
                Wap.Get("wap1", function(err, savedWap) {
                    _expect(err).to.be.null;
                    _expect(savedWap).to.not.be.null;
                    _expect(savedWap.content.length).to.be.equal(3);
                    done();
                })
            });
        });
    });

    describe("get", function() {
        it("basic", function(done) {
            Wap.Get("wap3", function(err, savedWap) {
                var wap3 = testwaps[3];
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.id).to.equal(wap3.id);
                _expect(savedWap.state).to.equal(wap3.state);
                _expect(savedWap.status).to.equal(wap3.status);
                _expect(savedWap.content).to.be.an.instanceof(Array);
                _expect(savedWap.content.length).to.equal(wap3.content.length);
                done();
            });
        });
    });

    describe("find", function() {
        it("found", function(done) {
            Wap.Find({id:"wap6"}, function(err, waps) {
                var wap6 = testwaps[6];
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(1);
                _expect(waps[0].id).to.equal(wap6.id);
                _expect(waps[0].status).to.equal(wap6.status);
                _expect(waps[0].content).to.be.an.instanceof(Array);
                _expect(waps[0].content.length).to.equal(wap6.content.length);
                done();
            });
        });

        it("notfound", function(done) {
            Wap.Find({id:"docnotfound"}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(0);
                done();
            });
        });

        it("multiples", function(done) {
            Wap.Find({"id" : /.*wap.*/}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.be.at.least(testwaps.length);
                done();
            });
        });

        it("all", function(done) {
            Wap.Find({}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.be.at.least(testwaps.length);
                done();
            });
        });
    });

    describe("random", function() {
        it("basic", function(done) {
            Wap.Random({}, 1, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(1);
                _expect(waps[0]).to.be.ok;
                _expect(waps[0].content).to.be.ok;
                _expect(waps[0].id).to.be.ok;
                console.log("random : ", waps[0].id);
                done();
            });
        });
    });
});