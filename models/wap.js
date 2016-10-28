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

module.exports = Wap = Object.assign({}, Doc);

Wap.VERBOSE = true;

Wap.ERROR = System.registerErrors({
    WAP_PARAMS : "Missing required params",
    WAP_NOTFOUND : "Can not find the wap",
    WAP_DUPLICATE : "Duplicate entry",
});
Wap.MESSAGE = System.registerMessages({
    WAP_SUCCESS : "Operation success"
})

/**
 * Wap Schema
 */
Wap.Schema = new _mongoose.Schema({
    canonical : {type:String, unique:true, required:true},

    author : String,
    title : String,
    metatitle : String,
    metalocale : String,
    metadescription : String,
    metaentity : String,
    metaimage : String,
    metafollow : Boolean,
    metaindex : Boolean,
    priority : Number,
    lastupdate : Date,
    since : {type:Date, default:Date.now},

    category : [String],
    crosslink : [String],
    alias : [String],
    showcount : {type:Number, min:0},
    
    statusCode : Number,
    statusMessage : String,
    loadDuration : Number,
    lastLoadDuration : Number,
    lastTitle : String,
    lastMetatitle : String,
    lastMetadescription : String,
    contentType : String,
    contentLength : Number,
    titleCount : Number,
    gtm : String,
    droneinfo : String 

}, { strict: true });


Wap.DB = _mongoose.model("Wap", Wap.Schema);


/**
 * Create
 * @param wap object
 * @param callback function Callback params (error, savedWap)
 */
Wap.Create = function (wap, callback) {
    var self = this;
    if(!wap || !wap.canonical)
        return System.callback(callback, [E(Wap.ERROR.WAP_PARAMS, wap), null]);

    var newwap = new self.DB();
    newwap.canonical = wap.canonical;
    newwap.author = wap.author;
    newwap.title = wap.title;
    newwap.metatitle = wap.metatitle;
    newwap.metalocale = wap.metalocale;
    newwap.metadescription = wap.metadescription;
    newwap.metaentity = wap.metaentity;
    newwap.metaimage = wap.metaimage;
    newwap.metafollow = wap.metafollow;
    newwap.metaindex = wap.metaindex;
    newwap.priority = wap.priority;
    newwap.lastupdate = wap.lastupdate || Date.now();;
    newwap.since = wap.since || Date.now();
    newwap.category = wap.category;
    newwap.crosslink = wap.crosslink;
    newwap.alias = wap.alias;
    newwap.showcount = 0;

    newwap.save(callback);
}

/**
 * Create
 * @param wap object
 * @param callback function Callback params (error, savedWap)
 */
Wap.getMap = function () {
var self = this;
    if(!id)
        return System.callback(callback, [E(Doc.ERROR.DOC_PARAMS, id), null]);

    return self.DB.find(
        {}, 
        {__v:0}, 
        function(err, doc) {
            if(err || !doc)
                err = E(Doc.ERROR.DOC_NOTFOUND, {error:err, id:id, doc:doc});
            System.callback(callback, [err, doc]);
        }
    );
}