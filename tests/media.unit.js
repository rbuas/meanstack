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

describe("unit.media", function() {
    var m;

    before(function(done) {
        m = new Memory({onconnect:function() {
            done();
        }});
    });

    after(function(done){
        Media.Remove({}, function() {
            m.disconnect(done);
        });
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

        it("nodir", function(done) {
            Media.ScrapDir(ROOT_DIR + "/tests/input/media-nodir", function(err, files) {
                _expect(err).to.be.ok;
                _expect(err.code).to.equal(Media.ERROR.MEDIA_NODIR);
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
                var count = Object.keys(files).length;
                _expect(count).to.be.equal(7);
                done();
            });
        });
    });

    describe("rgs", function() {
        it("lightroom-format", function(done) {
            Media.RGS(
                "RBUAS20161022-0034.jpg", 
                ROOT_DIR + "/tests/input/media-images", 
                ROOT_DIR + "/tests/input/media-images/web",
                function (err, media) {
                    _expect(err).to.be.null;
                    _expect(media.id).to.be.equal("RBUAS20161022-0034");
                    _expect(media.copyright).to.be.equal("rbuas");
                    _expect(media.author).to.be.equal("Rodrigo Buás");
                    _expect(media.authorrating).to.be.equal(3);
                    _expect(media.tags).to.be.ok;
                    _expect(media.tags).to.include("rbuas");
                    _expect(media.title).to.be.equal("poubelle à longueville");
                    _expect(media.type).to.be.equal("jpg");
                    _expect(media.width).to.be.equal(1365);
                    _expect(media.height).to.be.equal(2048);
                    _expect(media.xres).to.be.equal(72);
                    _expect(media.yres).to.be.equal(72);
                    _expect(media.orientation).to.be.equal("P");
                    _expect(media.caption).to.be.equal("vu de la fenetre vers une poubelle à longueville");
                    _expect(media.model).to.be.equal("Canon EOS 7D");
                    _expect(media.modelserial).to.be.equal("1070704906");
                    _expect(media.ex).to.be.equal(0.008);
                    _expect(media.fn).to.be.equal(6.7);
                    _expect(media.iso).to.be.equal(400);
                    _expect(media.wb).to.be.equal("Custom");
                    _expect(media.lens).to.be.equal("EF50mm f/1.2L USM");
                    _expect(media.focal).to.be.equal(50);
                    _expect(media.city).to.be.equal("Longueville");
                    _expect(media.state).to.be.equal("Île-de-France");
                    _expect(media.countrycode).to.be.equal("FR");
                    _expect(media.country).to.be.equal("France");
                    _expect(media.altitude).to.be.equal(85.9782);
                    _expect(media.latitude).to.be.ok;
                    _expect(media.latitude[0]).to.be.equal(48);
                    _expect(media.latitude[1]).to.be.equal(30.816);
                    _expect(media.latitude[2]).to.be.equal(0);
                    _expect(media.longitude).to.be.ok;
                    _expect(media.longitude[0]).to.be.equal(3);
                    _expect(media.longitude[1]).to.be.equal(15.0137);
                    _expect(media.longitude[2]).to.be.equal(0);
                    done();
                }
            );
        })
    });
});