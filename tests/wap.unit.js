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
var Wap = require(ROOT_DIR + "/models/wap");

describe("unit.wap", function() {
    var m;
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
        m = new Memory({onconnect:done});
    });

    after(function(done) {
        m.disconnect(done);
    });

    beforeEach(function(done) {
        var pending = testwaps.length;
        testwaps.forEach(function(wap, index, arr){
            Wap.Create(wap, "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                if(--pending <= 0) done();
            });
        });
    });

    afterEach(function(done) {
        Wap.Remove({}, function() {
            Wap.DRAFT.remove({}, done);
        });
    });

    describe("create", function() {
        afterEach(function(done) {
            Wap.Remove({id: "test"}, done);
        });

        it("null", function(done) {
            Wap.Create(null, "usertest", function(err, savedWap) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });
        it("empty", function(done) {
            Wap.Create({}, "usertest", function(err, savedWap) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });
        it("success", function(done) {
            Wap.Create({content:["test content"], id:"test"}, "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.id).to.be.equal("test");
                done();
            });
        });
        it("duplicate", function(done) {
            var doc = {content:"test content", id:"test"};
            Wap.Create(doc, "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                Wap.Create(doc, "usertest", function(err2, savedWap2) {
                    _expect(err2).to.not.be.null;
                    _expect(err2.code).to.equal(11000);
                    done();
                });
            });
        });
    });

    describe("remove", function() {
        it("success", function(done) {
            Wap.Remove({id: "post_3"}, function(err) {
                _expect(err).to.be.null;
                Wap.Find({id: "post_3"}, function(err, waps) {
                    _expect(err).to.be.null;
                    _expect(waps).to.not.be.null;
                    _expect(waps.length).to.equal(0);
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
                id:"home",
                content: ["changed content", "test2", "test3"]
            }, function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.content).to.be.ok;
                _expect(savedWap.content.length).to.be.equal(3);
                Wap.Get("home", function(err, savedWap) {
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
            Wap.Get("news", function(err, savedWap) {
                var wap3 = testwaps[3];
                _expect(err).to.be.null;
                _expect(savedWap).to.not.be.null;
                _expect(savedWap.path).to.equal(wap3.path);
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
            Wap.Find({id:"page_b"}, function(err, waps) {
                var wap6 = testwaps[6];
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(1);
                _expect(waps[0].path).to.equal(wap6.path);
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

        it("multiples-path", function(done) {
            Wap.Find({"path" : /.*page_.*/}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.be.at.least(1);
                done();
            });
        });

        it("multiples-state", function(done) {
            Wap.Find({state:Wap.STATE.PUBLIC}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.be.at.least(5);
                done();
            });
        });

        it("all", function(done) {
            Wap.Find({}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.be.at.least(7);
                done();
            });
        });

        it("type", function(done) {
            Wap.Find({type:"C"}, function(err, waps) {
                _expect(err).to.be.null;
                _expect(waps).to.not.be.null;
                _expect(waps.length).to.equal(2);
                Wap.Find({type:"A"}, function(err, waps) {
                    _expect(err).to.be.null;
                    _expect(waps).to.not.be.null;
                    _expect(waps.length).to.equal(5);
                    Wap.Find({type:"B"}, function(err, waps) {
                        _expect(err).to.be.null;
                        _expect(waps).to.not.be.null;
                        _expect(waps.length).to.equal(4);
                        done();
                    });
                });
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

    describe("draftget", function() {
        it("found", function(done) {
            Wap.DraftGet("history", function (err, draft) {
                _expect(err).to.be.null;
                _expect(draft).to.be.ok;
                _expect(draft.path).to.be.equal("history");
                _expect(draft.state).to.be.equal(Wap.STATE.DRAFT);
                done();
            });
        });

        it("notfound", function(done) {
            Wap.DraftGet("draftnotfound", function (err, draft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(draft).to.be.null;
                done();
            });
        });

        it("public", function(done) {
            Wap.DraftGet("home", function (err, draft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(draft).to.be.null;
                done();
            });
        });
    });

    describe("draftstart", function() {
        it("alreadydraft", function(done) {
            Wap.DraftStart({id:"history"}, "usertest", function (err, draft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(11000);
                _expect(draft).to.not.be.ok;
                done();
            });
        });

        it("publicbutnotalreadydraft", function(done) {
            Wap.DraftStart({id:"home"}, "usertest", function (err, draft) {
                _expect(err).to.be.null;
                _expect(draft).to.be.ok;
                _expect(draft.path).to.be.equal("home");
                _expect(draft.state).to.be.equal(Wap.STATE.DRAFT);
                done();
            });
        });

        it("newone", function(done) {
            Wap.DraftStart({id:"wapnotexistent"}, "usertest", function (err, draft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_NOTFOUND);
                _expect(draft).to.be.null;
                done();
            });
        });
    });

    describe("draftstartedition", function() {
        it("params", function(done) {
            Wap.DraftStartEdition("", null, function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });

        it("param-id", function(done) {
            Wap.DraftStartEdition("", "usertest", function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_PARAMS);
                _expect(savedWap).to.be.null;
                done();
            });
        });

        it("param-userid", function(done) {
            Wap.DraftStartEdition("history", "", function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_NOUSER);
                _expect(savedWap).to.be.null;
                done();
            });
        });

        it("notfound", function(done) {
            Wap.DraftStartEdition("wapnotfound", "usertest", function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_NOTFOUND);
                _expect(savedWap).to.be.null;
                done();
            });
        });

        it("indraft", function(done) {
            Wap.DraftStartEdition("history", "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.be.ok;
                _expect(savedWap.path).to.be.equal("history");
                _expect(savedWap.state).to.be.equal(Wap.STATE.EDITING);
                done();
            });
        });

        it("editing", function(done) {
            Wap.DraftStartEdition("post_2", "editortest", function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_EDITING);
                _expect(savedWap).to.be.ok;
                _expect(savedWap.path).to.be.equal("post_2");
                _expect(savedWap.state).to.be.equal(Wap.STATE.EDITING);
                done();
            });
        });

        it("inpublic", function(done) {
            Wap.DraftStartEdition("post_1", "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.be.ok;
                _expect(savedWap.path).to.be.equal("post_1");
                done();
            });
        });
    });

    describe("draftupdate", function() {
        it("sameauthor", function(done) { 
             Wap.DraftStartEdition("history", "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.be.ok;
                _expect(savedWap.path).to.be.equal("history");
                _expect(savedWap.state).to.be.equal(Wap.STATE.EDITING);
                savedWap.content = ["test 1", "test 2"];
                Wap.DraftUpdate(savedWap, "usertest", function(err, savedWap) {
                    _expect(err).to.be.null;
                    _expect(savedWap).to.be.ok;
                    _expect(savedWap.path).to.be.equal("history");
                    _expect(savedWap.content).to.contains("test 1");
                    done();
                });
            });
        });

        it("diffauthor", function(done) { 
             Wap.DraftStartEdition("history", "usertest", function(err, savedWap) {
                _expect(err).to.be.null;
                _expect(savedWap).to.be.ok;
                _expect(savedWap.path).to.be.equal("history");
                _expect(savedWap.state).to.be.equal(Wap.STATE.EDITING);
                savedWap.content = ["test 1", "test 2"];
                Wap.DraftUpdate(savedWap, "usertest2222", function(err, savedWap) {
                    _expect(err).to.be.ok;
                    _expect(err.code).to.be.equal(Wap.ERROR.WAP_PERMISSION);
                    _expect(savedWap).to.be.null;
                    done();
                });
            });
        });

        it("nonediting", function(done) { 
            Wap.DraftUpdate({id:"history","content" : ["test 1", "test 2"]}, "usertest", function(err, savedWap) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_STATE);
                _expect(savedWap).to.be.null;
                done();
            });
        });
    });

    describe("draftendedition", function() {
        it("editing-sameauthor", function(done) {
            Wap.DraftEndEdition("page_c", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.DRAFT);
                done();
            });
        });

        it("editing-diffauthor", function(done) {
            Wap.DraftEndEdition("page_c", "editortestother", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_PERMISSION);
                _expect(savedDraft).to.be.null;
                done();
            });
        });

        it("notediting", function(done) {
            Wap.DraftEndEdition("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_STATE);
                _expect(savedDraft).to.be.null;
                done();
            });
        });

        it("nodraft", function(done) {
            Wap.DraftEndEdition("home", "editortest", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(savedDraft).to.be.null;
                done();
            });
        });
    });

    describe("draftreview", function() {
        it("editing", function(done) {
            Wap.DraftReview("page_c", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.REVIEW);
                done();
            });
        });

        it("draft", function(done) {
            Wap.DraftReview("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.REVIEW);
                done();
            });
        });

        it("nodraft", function(done) {
            Wap.DraftReview("home", "editortest", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(savedDraft).to.be.null;
                done();
            });
        });
    });

    describe("draftreviewapprove", function() {
        it("draft", function(done) {
            Wap.DraftReviewApprove("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.APPROVED);
                done();
            });
        });

        it("nodraft", function(done) {
            Wap.DraftReviewApprove("home", "editortest", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(savedDraft).to.be.null;
                done();
            });
        });
    });

    describe("draftreviewrepprove", function() {
        it("draft", function(done) {
            Wap.DraftReviewRepprove("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.REPPROVED);
                done();
            });
        });

        it("nodraft", function(done) {
            Wap.DraftReviewRepprove("home", "editortest", function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(savedDraft).to.be.null;
                done();
            });
        });
    });

    describe("draftpublish", function() {
        it("draft-approved", function(done) {
            Wap.DraftReviewApprove("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.APPROVED);
                Wap.DraftPublish("history", null, function(err, savedWap) {
                    _expect(err).to.be.null;
                    _expect(savedWap).to.be.ok;
                    _expect(savedWap.state).to.be.equal(Wap.STATE.PUBLIC);
                    Wap.Get("history", function(err, savedWap) {
                        _expect(err).to.be.null;
                        _expect(savedWap).to.be.ok;
                        _expect(savedWap.state).to.be.equal(Wap.STATE.PUBLIC);
                       done();
                    })
                });
            });
        });

        it("draft-other", function(done) {
            Wap.DraftReviewRepprove("history", "editortest", function(err, savedDraft) {
                _expect(err).to.be.null;
                _expect(savedDraft).to.be.ok;
                _expect(savedDraft.state).to.be.equal(Wap.STATE.REPPROVED);
                Wap.DraftPublish("history", null, function(err, savedWap) {
                    _expect(err).to.be.ok;
                    _expect(err.code).to.be.equal(Wap.ERROR.WAP_STATE);
                    _expect(savedWap).to.be.null;
                    Wap.Get("history", function(err, savedWap) {
                        _expect(err).to.be.null;
                        _expect(savedWap).to.be.ok;
                        _expect(savedWap.state).to.be.equal(Wap.STATE.REPPROVED);
                       done();
                    })
                });
            });
        });

        it("nodraft", function(done) {
            Wap.DraftPublish("home", null, function(err, savedDraft) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(Wap.ERROR.WAP_DRAFTNOTFOUND);
                _expect(savedDraft).to.be.null;
                done();
            });
        });
    });

    describe("publishscheduled", function() {
        it("basic", function(done) {
            //TODO
            done();
        });
    });
});