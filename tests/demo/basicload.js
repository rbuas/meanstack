// call : ./node_modules/mocha/bin/_mocha ./tests/demo/basicload.js --colors

var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();

var Log = require("../../brain/log");
var WebDroneScraper = require("../../brain/webdronescraper");

describe("basicload", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        wdc = new WebDroneScraper();
    });

    after(function() {
        // runs after all tests in this block
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    it("loadpage google once", function(done) {
        wdc.scrapLink(
            {host:"www.google.com"}, 
            function(data, stats) {
                //Log.message("loadpage stats : ", stats);
                done();
            }
        );
    });

    it("loadpage session test", function(done) {
        wdc.scrapLink(
            {host:"localhost",port:"8080",path:"/session"}, 
            function(data, stats) {
                //Log.message("loadpage stats : ", stats);
                done();
            }
        );
    });

    it("loadpage 10 times", function(done) {
        wdc.scrapLink(
            {host:"localhost",port:"8080",path:"/session"}, 
            function(res) {
                //Log.message("loadpage stats : ", res);
                done();
            },
            10
        );
    });
});

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