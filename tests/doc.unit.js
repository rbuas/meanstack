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
var Doc = require(ROOT_DIR + "/models/doc");

describe("unit.doc", function() {
    var m;
    var doc = [
        "doc0 content test",
        "doc1 content test",
        "doc2 content test",
        "doc3 content test",
        "doc4 content test",
        "doc5 content test",
        "doc6 content test",
        "doc7 content test",
        "doc8 content test",
        "doc9 content test"
    ];

    before(function(done) {
        m = new Memory({onconnect:function() {
            var pending = doc.length;
            doc.forEach(function(value, index, arr){
                Doc.Create({content:value, id:"doc" + index}, function(err, savedDoc) {
                    if(--pending <= 0) done();
                });
            });
        }});
    });

    after(function(done){
        Doc.Remove({}, function(){
            m.disconnect(done);
        });
    });

    describe("create", function() {
        afterEach(function(done) {
            Doc.Remove({id: "test"}, done);
        });

        it("null", function(done) {
            Doc.Create(null, function(err, savedDoc) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Doc.ERROR.DOC_PARAMS);
                _expect(savedDoc).to.be.null;
                done();
            });
        });
        it("empty", function(done) {
            Doc.Create({}, function(err, savedDoc) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Doc.ERROR.DOC_PARAMS);
                _expect(savedDoc).to.be.null;
                done();
            });
        });
        it("success", function(done) {
            Doc.Create({content:"test content", id:"test"}, function(err, savedDoc) {
                _expect(err).to.be.null;
                _expect(savedDoc).to.not.be.null;
                _expect(savedDoc.content).to.be.equal("test content");
                _expect(savedDoc.id).to.be.equal("test");
                done();
            });
        });
        it("duplicate", function(done) {
            var doc = {content:"test content", id:"test"};
            Doc.Create(doc, function(err, savedDoc) {
                _expect(err).to.be.null;
                _expect(savedDoc).to.not.be.null;
                Doc.Create(doc, function(err2, savedDoc2) {
                    _expect(err2).to.not.be.null;
                    _expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            Doc.Remove({id: "doc3"}, function(err) {
                _expect(err).to.be.null;
                Doc.Find({id: "doc3"}, function(err, docs) {
                    _expect(err).to.be.null;
                    _expect(docs).to.not.be.null;
                    _expect(docs.length).to.equal(0);
                    doc.splice(3,1);
                    done();
                });
            });
        });
        it("notfound", function(done) {
            Doc.Find({id: "docnotfound"}, function(err, docs) {
                _expect(err).to.be.null;
                _expect(docs).to.not.be.null;
                _expect(docs.length).to.equal(0);
                Doc.Remove({id: "docnotfound"}, function(err) {
                    _expect(err).to.be.null;
                    done();
                });
            });
        });
    });

    describe("update", function() {
        it("content", function(done) {
            Doc.Update({
                id:"doc1",
                content: "changed content"
            }, function(err, savedDoc) {
                _expect(err).to.be.null;
                _expect(savedDoc).to.not.be.null;
                _expect(savedDoc.content).to.equal("changed content");
                Doc.Get("doc1", function(err, savedDoc) {
                    _expect(err).to.be.null;
                    _expect(savedDoc).to.not.be.null;
                    _expect(savedDoc.content).to.equal("changed content");
                    done();
                })
            });
        });
    });

    describe("get", function() {
        it("found", function(done) {
            Doc.Get("doc5", function(err, savedDoc) {
                _expect(err).to.be.null;
                _expect(savedDoc).to.not.be.null;
                _expect(savedDoc.id).to.equal("doc5");
                done();
            });
        });

        it("notfound", function(done) {
            Doc.Get("docnotfound", function(err, savedDoc) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Doc.ERROR.DOC_NOTFOUND);
                done();
            });
        });

        it("missingparams", function(done) {
            Doc.Get(null, function(err, savedDoc) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Doc.ERROR.DOC_PARAMS);
                done();
            });
        });

    });

    describe("find", function() {
        it("found", function(done) {
            Doc.Find({id:"doc6"}, function(err, docs) {
                _expect(err).to.be.null;
                _expect(docs).to.not.be.null;
                _expect(docs.length).to.equal(1);
                _expect(docs[0].id).to.equal("doc6");
                done();
            });
        });

        it("notfound", function(done) {
            Doc.Find({id:"docnotfound"}, function(err, docs) {
                _expect(err).to.be.null;
                _expect(docs).to.not.be.null;
                _expect(docs.length).to.equal(0);
                done();
            });
        });

        it("multiples", function(done) {
            Doc.Find({"id" : /.*doc.*/}, function(err, docs) {
                _expect(err).to.be.null;
                _expect(docs).to.not.be.null;
                _expect(docs.length).to.be.at.least(doc.length);
                done();
            });
        });

        it("all", function(done) {
            Doc.Find({}, function(err, docs) {
                _expect(err).to.be.null;
                _expect(docs).to.not.be.null;
                _expect(docs.length).to.be.at.least(doc.length);
                done();
            });
        });
    });
});