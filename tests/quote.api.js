var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _should = require("chai").should();
var _http = require("http");
var _cheerio = require("cheerio");
var _moment = require("moment");

global.ROOT_DIR = __dirname + "/..";

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var Memory = require(ROOT_DIR + "/brain/memory");
var TestRouteApi = require(ROOT_DIR + "/brain/testrouteapi");
var Quote = require(ROOT_DIR + "/models/quote");

/////////////
// TESTCLASS : TestQuoteApi
///////

TestQuoteApi.extends( TestRouteApi );
function TestQuoteApi (options) {
    TestRouteApi.call(this, options);
}

TestQuoteApi.prototype.quotes = function (category, callback) {
    var self = this;
    category = category || "";
    self.request({path : "/q/list/" + category, method : "GET"}, callback);
}

TestQuoteApi.prototype.quote = function (quoteid, callback) {
    var self = this;
    quoteid = quoteid || "";
    self.request({path : "/q/get/" + quoteid, method : "GET"}, callback);
}

describe("api.quote", function() {
    var m, test;
    var quotes = [
        {"category":"A", "author": "Ansel Adams","text": "You don't make a photograph just with a camera. You bring to the act of photography all the pictures you have seen, the books you have read, the music you have heard, the people you have loved."},
        {"category":"A", "author": "Ernst Haas","text": "I am not interested in shooting new things – I am interested to see things new."},
        {"category":"A", "author": "Ted Grant","text": "When you photograph people in color, you photograph their clothes. But when you photograph people in Black and white, you photograph their souls."},
        {"category":"B", "author": "Ansel Adams","text": "You don’t take a photograph, you make it."},
        {"category":"B", "author": "Ansel Adams","text": "To the complaint, 'There are no people in these photographs,' I respond, There are always two people: the photographer and the viewer."},
        {"category":"B", "author": "Henri Cartier-Bresson","text": "Your first 10,000 photographs are your worst."},
        {"category":"C", "author": "Henri Cartier-Bresson","text": "To photograph: it is to put on the same line of sight the head, the eye and the heart."},
        {"category":"D", "author": "Henri Cartier-Bresson","text": "Photographier c’est mettre sur la même ligne de mire la tête, l’oeil et le coeur."},
        {"category":"D", "author": "John Stuart Mill","text": "La photographie est une brève complicité entre la prévoyance et le hasard."},
        {"category":"D", "author": "Henri Cartier-Bresson","text": "To me, photography is the simultaneous recognition in a fraction of a second of the significance of an event."},
        {"category":"D", "author": "Robert Frank","text": "The eye should learn to listen before it looks."},
        {"category":"D", "author": "Tim Walker","text": "Only photograph what you love."},
        {"category":"E", "author": "Ralph Gibson","text": "Une photographie forte, ce n’est plus l’image de quelque chose, c’est quelque chose en soi."}
    ];

    before(function(done) {
        test = new TestQuoteApi({ urlbase : "localhost", port:8080 });
        m = new Memory({onconnect:function() {
            Quote.Remove({}, function(){
                var pending = quotes.length;
                quotes.forEach(function(value, index, arr){
                    Quote.Create(value, function(err, savedQuote) {
                        value.id = savedQuote.id;
                        if(--pending <= 0) done();
                    });
                });
            });
        }});
    });

    after(function(done){
        Quote.Remove({}, function(){
            m.disconnect(done);
        });
    });

    describe("random", function() {
        it("null", function(done) {
            test.quotes(null, function(err, info, data) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(TestRouteApi.ERROR.TEST_SERVER);
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(404);
                _expect(data).to.be.null;
                done();
            });
        });
        it("category-multiple", function(done) {
            test.quotes("A", function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(Quote.MESSAGE.QUOTE_SUCCESS);
                _expect(data.quotes).to.be.ok;
                _expect(data.quotes.length).to.be.equal(1);
                _expect(data.quotes[0].text).to.be.ok;
                _expect(data.quotes[0].author).to.be.ok;
                done();
            });
        });
        it("category-unique", function(done) {
            test.quotes("C", function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(Quote.MESSAGE.QUOTE_SUCCESS);
                _expect(data.quotes).to.be.ok;
                _expect(data.quotes.length).to.be.equal(1);
                _expect(data.quotes[0].author).to.be.equal("Henri Cartier-Bresson");
                _expect(data.quotes[0].category).to.have.members(["C"]);
                _expect(data.quotes[0].text).to.be.ok;
                done();
            });
        });
        it("category-empty", function(done) {
            test.quotes("F", function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(Quote.MESSAGE.QUOTE_SUCCESS);
                _expect(data.quotes).to.be.ok;
                _expect(data.quotes.length).to.be.equal(0);
                done();
            });
        });
    });

    describe("get", function() {
        it("null", function(done) {
            test.quote(null, function(err, info, data) {
                _expect(err).to.be.ok;
                _expect(err.code).to.be.equal(TestRouteApi.ERROR.TEST_SERVER);
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(404);
                _expect(data).to.be.null;
                done();
            });
        });
        it("success", function(done) {
            var quote = quotes[3];
            test.quote(quote.id, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.be.ok;
                _expect(data.success).to.be.equal(Quote.MESSAGE.QUOTE_SUCCESS);
                _expect(data.quote).to.be.ok;
                _expect(data.quote.text).to.be.equal(quote.text);
                _expect(data.quote.author).to.be.equal(quote.author);
                done();
            });
        });
        it("notfound", function(done) {
            test.quote(null, function(err, info, data) {
                _expect(info).to.be.ok;
                _expect(info.statusCode).to.be.equal(404);
                done();
            });
        });
    });

});