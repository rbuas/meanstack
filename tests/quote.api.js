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
    self.request({path : "/s/quotes/" + category, method : "GET"}, callback);
}

TestQuoteApi.prototype.quote = function (quoteid, callback) {
    var self = this;
    quoteid = quoteid || "";
    self.request({path : "/s/quote/" + quoteid, method : "GET"}, callback);
}

describe.only("api.quote", function() {
    var m, test;
    var quotes = [
        {"author": "Ansel Adams","text": "You don't make a photograph just with a camera. You bring to the act of photography all the pictures you have seen, the books you have read, the music you have heard, the people you have loved."},
        {"author": "Ernst Haas","text": "I am not interested in shooting new things – I am interested to see things new."},
        {"author": "Ted Grant","text": "When you photograph people in color, you photograph their clothes. But when you photograph people in Black and white, you photograph their souls."},
        {"author": "Ansel Adams","text": "You don’t take a photograph, you make it."},
        {"author": "Ansel Adams","text": "To the complaint, 'There are no people in these photographs,' I respond, There are always two people: the photographer and the viewer."},
        {"author": "Henri Cartier-Bresson","text": "Your first 10,000 photographs are your worst."},
        {"author": "Henri Cartier-Bresson","text": "To photograph: it is to put on the same line of sight the head, the eye and the heart."},
        {"author": "Henri Cartier-Bresson","text": "Photographier c’est mettre sur la même ligne de mire la tête, l’oeil et le coeur."},
        {"author": "John Stuart Mill","text": "La photographie est une brève complicité entre la prévoyance et le hasard."},
        {"author": "Henri Cartier-Bresson","text": "To me, photography is the simultaneous recognition in a fraction of a second of the significance of an event."},
        {"author": "Robert Frank","text": "The eye should learn to listen before it looks."},
        {"author": "Tim Walker","text": "Only photograph what you love."},
        {"author": "Ralph Gibson","text": "Une photographie forte, ce n’est plus l’image de quelque chose, c’est quelque chose en soi."}
    ];

    before(function(done) {
        test = new TestQuoteApi({ urlbase : "localhost", port:8080 });
        m = new Memory({onconnect:function() {
            var pending = quotes.length;
            quotes.forEach(function(value, index, arr){
                Quote.Create(value, function(err, savedQuote) {
                    value.id = savedQuote.id;
                    if(--pending <= 0) done();
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
        it("success", function(done) {
            test.quotes(null, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email1);
                _expect(data.user.password).to.not.be.ok;
                done();
            });
        });
        it("success", function(done) {
            test.quotes(null, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email1);
                _expect(data.user.password).to.not.be.ok;
                done();
            });
        });
    });

    describe("get", function() {
        it("success", function(done) {
            test.quote(null, function(err, info, data) {
                _expect(info).to.not.be.null;
                _expect(info.statusCode).to.be.equal(200);
                _expect(data).to.not.be.null;
                _expect(data.success).to.be.equal(User.MESSAGE.USER_SUCCESS);
                _expect(data.user).to.not.be.null;
                _expect(data.user.email).to.be.equal(email1);
                _expect(data.user.password).to.not.be.ok;
                done();
            });
        });
    });

});