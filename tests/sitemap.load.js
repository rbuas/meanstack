var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();

var Log = require("../brain/log");
var WebDroneScraper = require("../brain/webdronescraper");

describe("load", function() {
    var wdc;

    before(function(done) {
        // runs before all tests in this block
        wdc = new WebDroneScraper();
        done();
    });
    after(function() {
        //Log.message("Stats: ", wdc.stats);
    });

    it("sitemap-once", function(done) {
        wdc.sitemap(
            "../sitemap.json",
            "localhost",
            "8080",
            function (data, stats) {
                _expect(data).to.be.not.null;
                _expect(stats).to.not.be.null;

                var url = wdc.getStatsUrl(stats) || "";
                Log.message("SITEMAP::" + url);

                _expect(stats.complete).to.be.equal(true);
                _expect(stats.statusCode).to.be.equal(200);

                if(stats.duration > 1000) {
                    Log.warning("Exceeding load time limits");
                }
                if(stats.contentLength > 500000) {
                    Log.warning("Exceeding load size limits");
                }
            },
            function (data, stats) {
                Log.message("Stats: ", stats);
                done();
            }
        );
    });
});