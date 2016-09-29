var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _log = require("../libs/log");
var WebDroneScraper = require("../libs/webdronescraper");

describe("session", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        wdc = new WebDroneScraper();
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