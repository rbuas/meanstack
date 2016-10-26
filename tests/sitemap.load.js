var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();

global.ROOT_DIR = __dirname + "/..";

var Log = require(ROOT_DIR + "/brain/log");
var WebDroneScraper = require(ROOT_DIR + "/brain/webdronescraper");



describe("load", function() {
    var wdc;

    before(function(done) {
        // runs before all tests in this block
        wdc = new WebDroneScraper();
        done();
    });
    after(function(done) {
        //Log.message("Stats: ", wdc.stats);
        done();
    });

    it("sitemap-once", function(done) {
        wdc.sitemap({
            mapfile : "../sitemap.json",
            hostname : "www.locatour.com",
            port : 80,
            eachCallback : function (data, stats) {
                _expect(stats).to.be.ok;
                _expect(stats.statusCode).to.be.equal(200);
                _expect(data).to.be.not.null;

                var url = wdc.getStatsUrl(stats) || "";
                Log.message("SITEMAP::" + url);


                if(stats.duration > 1000) {
                    Log.warning("Exceeding load time limits");
                }
                if(stats.contentLength > 500000) {
                    Log.warning("Exceeding load size limits");
                }
            },  
            endCallback : function (data, stats) {
                Log.message("Stats: ", stats);
                done();
            },
        });
    });
});