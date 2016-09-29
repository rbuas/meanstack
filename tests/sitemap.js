var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _log = require("../libs/log");
var WebDroneScraper = require("../libs/webdronescraper");

describe("basicload", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        wdc = new WebDroneScraper();
    });
    after(function() {
        _log.message("Stats: ", wdc.stats);
    });

    it("load sitemap", function(done) {
        wdc.sitemap(
            "../sitemap.json",
            "localhost",
            "8080",
            null,
            function(data, stats) {
                done();
            }
        );
    });
});