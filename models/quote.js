var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");
var _querystring = require("querystring");
var _crypto = require("crypto");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var Config = require(ROOT_DIR + "/brain/config");
var E = System.error;
var WebMailer = require(ROOT_DIR + "/brain/webmailer");
var Dictionary = require(ROOT_DIR + "/brain/dictionary");
var I = Dictionary.get;
var User = require(ROOT_DIR + "/models/user");

module.exports = Quote = {};

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
    category : {type:String},
    date : Date,
    since : {type:Date, default:Date.now()},
    ratepos : [],
    rateneg : [],
    showcount : {type:Number, min:0}
}, { strict: true });


Quote.Schema.pre("save", function(next) {
    var quote = this;

    next();
});


Quote.DB = _mongoose.model("Quote", Quote.Schema);


/**
 * Create
 * @param quote object
 * @param callback function Callback params (error, savedQuote)
 */
Quote.Create = function(quote, callback) {
    if(!quote || !quote.text || !quote.author)
        return System.callback(callback, E(Quote.ERROR.QUOTE_PARAMS, quote), null);

    var newquote = new Quote.DB();
    newquote.since = quote.since || Date.now();
    newquote.showcount = 0;
    newquote.ratepos = [];
    newquote.rateneg = [];
    newquote.date = quote.date;
    newquote.author = quote.author;
    newquote.text = quote.text;

    newquote.save(callback);
}


/**
 * Get
 * @param quoteid String
 * @param callback function Callback params (error, quote)
 */
Quote.Get = function(quoteid, callback) {
    if(!quoteid)
        return System.callback(callback, E(Quote.ERROR.QUOTE_PARAMS), null);

    return Quote.DB.findOne(
        {_id:quoteid}, 
        {__v:0}, 
        function(err, quote) {
            if(err || !quote)
                err = E(Quote.ERROR.QUOTE_NOTFOUND, {error:err, quoteid:quoteid, quote:quote});
            if(callback) callback(err, quote);
        }
    );
}


/**
 * Update
 * @param quote object
 * @param callback function Callback params (error, savedQuote)
 */
Quote.Update = function (quote, callback) {
    if(!quote || !quote.id)
        return System.callback(callback, E(Quote.ERROR.QUOTE_PARAMS, quote), null)

    Quote.Get(quote.id, function(err, savedQuote) {
        if(err || !savedQuote)
            return System.callback(callback, E(Quote.ERROR.QUOTE_NOTFOUND, err), null);

        savedQuote = Object.assign(savedQuote, quote);
        savedQuote.save(callback);
    });
}


/**
 * Remove
 * @param where Quote properties in where syntaxe
 * @param callback function Callback params (error)
 */
Quote.Remove = function (where, callback) {
    Quote.DB.remove(where, callback);
}


/**
 * Find
 * @param where Quote properties in where syntaxe
 * @param callback function Callback params (error, quotes)
 */
Quote.Find = function(where, callback) {
    if(where.text) where.text = new RegExp(RegExp.escape(where.text), 'i');
    if(where.author) where.author = new RegExp(RegExp.escape(where.author), 'i');
    if(where.since) where.since = {$gt : where.since};

    return Quote.DB.find(
        where, 
        {__v:0}, 
        function(err, quotes) {
            if(err || !quotes)
                err = E(Quote.QUOTE.QUOTE_NOTFOUND, err);
            if(callback) callback(err, quotes);
        }
    );
}


/**
 * Random get a random quote
 * @param category String
 * @param count Number
 * @param callback function Callback params (error, quotes)
 */
Quote.Random = function(category, count, callback) {
    Quote.DB.count({category:category}, function(err, catCount) {
        if(err)
            return System.callback(callback, E(Quote.ERROR.QUOTE_COUNT, err), null);

        if(count > catCount) count = catCount;

        var start = Math.floor(Math.random() * (catCount - count + 1));
        var options = {
            skip : start,
            limit : count, 
        };
        var fields = {};
        var query = Quote.DB.find({category:category}, fields, options);
        query.exec(callback);
    });
}

/**
 * RatePos Rate as a good quote
 * @param quoteid
 * @param callback function Callback params (error, savedQuote)
 */
Quote.RatePos = function(quoteid, userid, callback) {
    if(!quoteid || !userid)
        return System.callback(callback, E(Quote.ERROR.QUOTE_PARAMS, {quoteid:quoteid, userid:userid}), null);

    User.Find({_id:userid}, function(err, users) {
        if(err || !users || users.length < 1)
            return System.callback(callback, E(Quote.ERROR.QUOTE_USER, userid), null);

        Quote.Get(quoteid, function(err, quote) {
            if(err || !quote)
                return err;

            quote.ratepos.push(userid);
            quote.save(callback);
        });
    });
}

/**
 * RateNeg Rate as a not good quote
 * @param quoteid
 * @param callback function Callback params (error, savedQuote)
 */
Quote.RateNeg = function(category, userid, callback) {
    if(!quoteid || !userid)
        return System.callback(callback, E(Quote.ERROR.QUOTE_PARAMS, {quoteid:quoteid, userid:userid}), null);


    User.Find({_id:userid}, function(err, users) {
        if(err || !users || users.length < 1)
            return System.callback(callback, E(Quote.ERROR.QUOTE_USER, userid), null);

        Quote.Get(quoteid, function(err, quote) {
            if(err || !quote)
                return err;

            quote.rateneg.push(userid);
            quote.save(callback);
        });
    });
}