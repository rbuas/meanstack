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
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var ViewEngine = require(ROOT_DIR + "/brain/viewengine");
var Quote = require(ROOT_DIR + "/models/quote");

describe("unit.quote", function() {
    var m;
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

    describe("create", function() {
        it("null", function(done) {
            Quote.Create(null, function(err, savedQuote) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Quote.ERROR.QUOTE_PARAMS);
                _expect(savedQuote).to.be.null;
                done();
            });
        });
        it("empty", function(done) {
            Quote.Create({}, function(err, savedQuote) {
                _expect(err).to.not.be.null;
                _expect(err.code).to.equal(Quote.ERROR.QUOTE_PARAMS);
                _expect(savedQuote).to.be.null;
                done();
            });
        });
        it("success", function(done) {
            Quote.Create({author:"rbuas", text:"blablabla"}, function(err, savedQuote) {
                _expect(err).to.be.null;
                _expect(savedQuote).to.not.be.null;
                _expect(savedQuote.text).to.be.equal("blablabla");
                _expect(savedQuote.author).to.be.equal("rbuas");
                Quote.Remove({author: "rbuas"}, done);
            });
        });
        it("duplicate", function(done) {
            var quote = {author:"rbuas", text:"blablabla"};
            Quote.Create(quote, function(err, savedQuote) {
                _expect(err).to.be.null;
                _expect(savedQuote).to.not.be.null;
                Quote.Create(quote, function(err, savedQuote) {
                    _expect(err).to.not.be.null;
                    _expect(err.code).to.equal(11000);
                    Quote.Remove({author: "rbuas"}, done);
                });
            });
        });
    });

    describe("random", function() {
        it("basic", function(done) {
            Quote.Random({}, 1, function(err, quotes) {
                _expect(err).to.be.null;
                _expect(quotes).to.not.be.null;
                _expect(quotes.length).to.equal(1);
                _expect(quotes[0]).to.be.ok;
                _expect(quotes[0].author).to.be.ok;
                _expect(quotes[0].text).to.be.ok;
                console.log("random : ", quotes[0].author, quotes[0].text);
                done();
            });
        });

        it("multiples", function(done) {
            Quote.Random({}, 3, function(err, quotes) {
                _expect(err).to.be.null;
                _expect(quotes).to.not.be.null;
                _expect(quotes.length).to.equal(3);
                _expect(quotes[0]).to.be.ok;
                _expect(quotes[0].text).to.be.ok;
                _expect(quotes[0].author).to.be.ok;
                _expect(quotes[1]).to.be.ok;
                _expect(quotes[1].text).to.be.ok;
                _expect(quotes[1].author).to.be.ok;
                _expect(quotes[2]).to.be.ok;
                _expect(quotes[2].text).to.be.ok;
                _expect(quotes[2].author).to.be.ok;
                console.log("random : ", quotes[0].author, quotes[1].author, quotes[2].author);
                done();
            });
        });

        it("bounds", function(done) {
            Quote.Random({}, 20, function(err, quotes) {
                _expect(err).to.be.null;
                _expect(quotes).to.not.be.null;
                _expect(quotes.length).to.equal(13);
                done();
            });
        });
    });
});