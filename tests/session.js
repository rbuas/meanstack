var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _casper = require("casper").create();
var _wdc = require("../libs/webdronescraper");
var _log = require("../libs/log");

describe("session", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        wdc = new _wdc.WebDroneScraper();
    });

    it("check empty", function(done) {
        wdc.scrap(
            {
                host:"localhost", port:"8080", path:"/session", 
                callback: function(data) {
                    _expect(data).to.equal("");
                    done();
                }
            }
        );
    });

    it("set test", function(done) {
        wdc.scrap(
            {
                host:"localhost", port:"8080", path:"/session/test", 
                callback: function(data) {
                    _expect(data).to.equal("test");
                    done();
                }
            }
        );
    });

    it("check empty after set into other session", function(done) {
        wdc.scrap(
            {
                host:"localhost", port:"8080", path:"/session", 
                callback: function(data) {
                    _expect(data).to.equal("");
                    done();
                }
            }
        );
    });

});

describe("basic navigation", function() {
    it("rbuas.com", function(done) {
        _casper.start("http://rbuas.com");
        _casper.then(function() {
            _log.message("Page title : ", this.getTitle());
        });
    });
});