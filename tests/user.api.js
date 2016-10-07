var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var WebMailer = require("../brain/webmailer");
var TestRouteApi = require("../brain/testrouteapi");
var User = require("../models/user");

WebMailer.FAKE = true;
WebMailer.SILENCE = true;
User.VERBOSE = false;

describe("unit.user", function() {
    var test;
    var email1 = "rodrigobuas+unittest@gmail.com";
    var email2 = "rodrigobuas+unittest2@gmail.com";
    var email3 = "rodrigobuas+unittest3@gmail.com";
    var email4 = "rodrigobuas+unittest4@gmail.com";
    var password = "123456";

    before(function(done) {
        test = new TestRouteApi();
    });

    after(function(done){
    });

    describe("create", function() {
        afterEach(function(done) {
        });

        it("null", function(done) {
        });
    });
});