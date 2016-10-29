var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");
var _querystring = require("querystring");
var _crypto = require("crypto");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Doc = require(ROOT_DIR + "/models/doc");

module.exports = Quote = Object.assign({}, Doc);

Quote.VERBOSE = true;

Quote.ERROR = System.registerErrors({
    QUOTE_PARAMS : "Missing required params",
    QUOTE_NOTFOUND : "Can not find the quote",
    QUOTE_DUPLICATE : "Duplicate entry",
});
Quote.MESSAGE = System.registerMessages({
    QUOTE_SUCCESS : "Operation success"
})

/**
 * Quote Schema
 */
Quote.Schema = new _mongoose.Schema({
    author : {type:String, required:true},
    text : {type:String, unique:true, required:true},
    category : [String],
    date : Date,
    since : {type:Date, default:Date.now},
    showcount : {type:Number, min:0}
}, { strict: true });


Quote.DB = _mongoose.model("Quote", Quote.Schema);


/**
 * Create
 * @param quote object
 * @param callback function Callback params (error, savedQuote)
 */
Quote.Create = function(quote, callback) {
    var self = this;
    if(!quote || !quote.text || !quote.author)
        return System.callback(callback, [E(Quote.ERROR.QUOTE_PARAMS, quote), null]);

    var newquote = new self.DB();
    newquote.since = quote.since || Date.now();
    newquote.showcount = 0;
    newquote.date = quote.date;
    newquote.author = quote.author;
    newquote.text = quote.text;
    newquote.category = typeof(quote.category) == "string" ? [quote.category] : [];

    newquote.save(callback);
}