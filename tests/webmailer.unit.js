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


describe("webmailer", function() {
    var wm;

    before(function(done) {
        wm = new WebMailer();
        done();
    });

    after(function(done) {
    });

    describe("send", function() {
        if("success", function(done) {
            wm.send({}, function(err, info) {
                done();
            });
        });
    });
});