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
    WAP_STATE : "State machine operation invalid"
});
Wap.MESSAGE = System.registerMessages({
    WAP_SUCCESS : "Operation success"
});
Wap.TYPE = {
    PAGE : "PAGE"
};
Wap.STATUS = {
    BLOCKED : "BLOCKED",
    ACTIVE : "ACTIVE"
};
Wap.STATE = {
    DEV : "DEV",
    EDITION : "EDITION",
    REVISION : "REVISION",
    TEST : "TEST",
    SCHEDULED : "SCHEDULED",
    PUBLIC : "PUBLIC"
};

/**
 * Wap Schema
 */
Wap.Schema = new _mongoose.Schema({
    id : {type:String, unique:true, required:true},
    path : {type:String, unique:true, required:true},
    author : String,
    chiefeditor : String,
    priority : Number,
    since : {type:Date, default:Date.now},
    publicdate : {type:Date, default:Date.now},
    lastupdate : Date,

    type : String,
    resume : String,
    content : [String],
    category : [String],
    crosslink : [String],
    alias : [String],

    status : {type:String, enum:JsExt.getObjectValues(Wap.STATUS)},
    state : {type:String, enum:JsExt.getObjectValues(Wap.STATE)},
    showcount : {type:Number, min:0},

    canonical : String,
    title : String,
    metatitle : String,
    metalocale : String,
    metadescription : String,
    metaentity : String,
    metaimage : String,
    metafollow : Boolean,
    metaindex : Boolean,

    statusCode : Number,
    statusMessage : String,
    loadDuration : Number,
    contentType : String,
    contentLength : Number,
    titleCount : Number,
    gtm : String,
    droneinfo : String,

    lastLoadDuration : Number,
    lastTitle : String,
    lastMetatitle : String,
    lastMetadescription : String

}, { strict: true });
Wap.PUBLIC_PROPERTIES = {
    path : 1,
    id : 1,
    author : 1,
    chiefeditor : 1,
    since : 1,
    publicdate : 1,
    lastupdate : 1,
    status : 1,
    type : 1,
    resume : 1,
    content : 1,
    category : 1,
    crosslink : 1,
    showcount : 1,
    canonical : 1,
    title : 1,
    metatitle : 1,
    metalocale : 1,
    metadescription : 1,
    metaentity : 1,
    metaimage : 1,
    metafollow : 1,
    metaindex : 1
};
Wap.MAP_PROPERTIES = {
    path : 1,
    id : 1,
    status : 1,
    type : 1,
    resume : 1,
    category : 1,
    canonical : 1,
    title : 1
};

Wap.DB = _mongoose.model("Wap", Wap.Schema);
Wap.STATS = _mongoose.model("WapStats", Wap.Schema);

/**
 * Create
 * @param wap object
 * @param callback function Callback params (error, savedWap)
 */
Wap.Create = function (wap, callback) {
    var self = this;
    if(!wap || (!wap.path && !wap.id))
        return System.callback(callback, [E(Wap.ERROR.WAP_PARAMS, wap), null]);

    var newwap = new self.DB();
    newwap.id = wap.id || wap.path;
    newwap.path = wap.path || wap.id;
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
    newwap.publicdate = wap.publicdate || Date.now();
    newwap.state = wap.state;
    newwap.status = wap.status || Wap.STATUS.BLOCKED;
    newwap.content = wap.content;
    newwap.type = wap.type || Wap.TYPE.PAGE;
    newwap.resume = wap.resume;
    newwap.category = wap.category;
    newwap.crosslink = wap.crosslink;
    newwap.alias = wap.alias;
    newwap.showcount = 0;

    newwap = assertStateMachine(newwap);

    newwap.save(callback);
}

/**
 * Find return an array of waps that match with 'where'' filter properties
 * @param where Filter object that contains wap informations
 * @param callback function Callback params (error, statsArr)
 */
Wap.Find = function (where, callback) {
    var self = this;
    self.DB.find(where, Wap.PUBLIC_PROPERTIES, callback);
}

/**
 * GetMap return the list of registered waps
 * @param where Filter object
 * @param callback function Callback params (error, wapmap)
 */
Wap.GetMap = function (where, callback) {
    var self = this;
    where = where || {};
    return self.DB.find(
        where, 
        Wap.MAP_PROPERTIES,
        function(err, wapmap) {
            if(err || !wapmap)
                err = E(Doc.ERROR.DOC_NOTFOUND, {error:err, wapmap:wapmap});
            System.callback(callback, [err, wapmap]);
        }
    );
}

/**
 * StockStats stock stats information into STATS table
 * @param stats Object that contains stats and path
 * @param callback function Callback params (error, savedStats)
 */
Wap.StockStats = function (stats, callback) {
    if(!stats || !stats.path)
        return System.callback(callback);

    Wap.STATS.findOne({path : stats.path}, {}, function(err, wapstats) {
        if(err || !wapstats) {
            //stock new stats
            var newstats = new Wap.STATS();
            newstats = Object.assign(newstats, stats);
            newstats.save(callback); 
        } else {
            //keep last info
            stats.lastLoadDuration = wapstats.loadDuration,
            stats.lastTitle = wapstats.title;
            stats.lastMetatitle = wapstats.metatitle;
            stats.lastMetadescription = wapstats.metadescription;
            //update stats
            wapstats = Object.assign(wapstats, stats);
            wapstats.save(callback);
        }
    });
}

/**
 * GetStats return stats information
 * @param stats Filter object that contains stats informations
 * @param callback function Callback params (error, statsArr)
 */
Wap.GetStats = function (stats, callback) {
    Wap.STATS.find(stats, {}, callback);
}

/**
 * PublishScheduled Search for SCHEDULED waps in the past to publish it 
 * @param callback function Callback params (error, waps)
 */
Wap.PublishScheduled = function (callback) {
    var self = this;
    var where = {
        state : Wap.STATE.SCHEDULED, 
        publicdate : {$gte : _moment()}    
    };
    self.DB.find(where, {}, function(err, waps) {
        if(err || !waps)
            return System.callback(callback, [err, waps]);
        
        if(waps.length <= 0)
            return System.callback(callback, [err, waps]);

        var pending = waps.length;
        waps.forEach(function(wap, index) {
            if(!wap) return;

            wap.STATE = Wap.STATE.PUBLIC;
            wap.save(function(err, savedWap) {
                if(--pending <= 0) System.callback(callback, [err, waps]);
            });
        })
    });

}

Wap.Publish = function (id, publicdate, callback) {
    var self = this;
    self.Get(id, function(err, wap) {
        if(err || !wap)
            return System.callback(callback, [err, wap]);
        
        if(wap.state != Wap.STATE.TEST)
            return System.callback(callback, [E(Wap.ERROR.WAP_STATE), wap]);

        wap.state = dateInFuture(wap.publicdate) ? Wap.STATE.SCHEDULED : Wap.STATE.PUBLIC;
        wap.save(callback);
    });
}

function assertStateMachine (newwap) {
    if(newwap.state == Wap.STATE.PUBLIC) {
        var isPublicDateInFuture = dateInFuture(newwap.publicdate);
        if(isPublicDateInFuture)
            newwap.STATE = Wap.STATE.SCHEDULED;
    }
    return newwap;
}

function dateInFuture (date) {
    if(!date) return false;

    var target = _moment(date, "DD/MM/YYYY");
    return _moment().diff(target) < 0;
}