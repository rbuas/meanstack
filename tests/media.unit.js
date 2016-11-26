var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

global.ROOT_DIR = __dirname + "/..";

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var Memory = require(ROOT_DIR + "/brain/memory");
var Media = require(ROOT_DIR + "/models/media");

describe.only("unit.media", function() {
    var m;

    before(function(done) {
        m = new Memory({onconnect:function() {
            done();
        }});
    });

    after(function(done){
        m.disconnect(done);
    });

    describe("scrapdir", function() {
        it("null", function(done) {
            Media.ScrapDir(null, function(err, files) {
                _expect(err).to.be.ok;
                _expect(err.code).to.equal(Media.ERROR.MEDIA_PARAMS);
                _expect(files).to.be.null;
                done();
            });
        });

        it("empty", function(done) {
            Media.ScrapDir(ROOT_DIR + "/tests/input/media-empty", function(err, files) {
                _expect(err).to.be.null;
                _expect(files).to.be.ok;
                _expect(files.length).to.be.equal(0);
                done();
            });
        });

        it("images", function(done) {
            Media.ScrapDir(ROOT_DIR + "/tests/input/media-images", function(err, files) {
                _expect(err).to.be.null;
                _expect(files).to.be.ok;
                _expect(files.length).to.be.equal(5);
                done();
            });
        });
    });
});