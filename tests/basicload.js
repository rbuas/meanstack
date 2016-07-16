var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _log = require("../libs/log");
var _wdc = require("../libs/webdronescraper");

describe("basicload", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        wdc = new _wdc.WebDroneScraper();
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
                //_log.message("loadpage stats : ", stats);
                done();
            }
        );
    });

    it("loadpage session test", function(done) {
        wdc.scrapLink(
            {host:"localhost",port:"8080",path:"/session"}, 
            function(data, stats) {
                //_log.message("loadpage stats : ", stats);
                done();
            }
        );
    });

    it("loadpage 10 times", function(done) {
        wdc.scrapLink(
            {host:"localhost",port:"8080",path:"/session"}, 
            function(res) {
                //_log.message("loadpage stats : ", res);
                done();
            },
            10
        );
    });
});