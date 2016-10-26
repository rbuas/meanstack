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
var Quote = require(ROOT_DIR + "/models/quote");

describe("unit.quote", function() {
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
});