var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();

global.ROOT_DIR = __dirname + "/..";

var Log = require(ROOT_DIR + "/brain/log");
var WebDroneScraper = require(ROOT_DIR + "/brain/webdronescraper");

describe("load.sitemap", function() {
    var wdc;

    before(function(done) {
        wdc = new WebDroneScraper();
        done();
    });
    after(function(done) {
        done();
    });

    it("sitemap", function(done) {
        wdc.sitemap({
            mapfile : "../sitemap.json",
            hostname : "www.locatour.com",
            port : 80,
            scrapCallback : function ($) {
                if(!$) return;

                var titleinfo = $("h1");
                var canonical = $("link[rel='canonical']");
                return {
                    title : titleinfo.text(),
                    titleCount : titleinfo ? titleinfo.length : 0,
                    canonical : canonical.attr("href")
                };
            },
            eachCallback : function (data, stats) {
                _expect(data).to.be.not.null;
                _expect(stats).to.be.ok;
                _expect(stats.statusCode).to.be.equal(200);
                _expect(stats.duration).to.be.below(2000);
                _expect(stats.contentLength).to.be.below(500000);
            },
            endCallback : function (data, stats) {
                Log.message("Stats: ", stats);
                done();
            }
        });
    });
});