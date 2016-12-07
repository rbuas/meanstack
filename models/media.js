var _mongoose = require("mongoose");
var _moment = require("moment");
var _path = require("path");
var _fs = require("fs");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var MediaExt = require(ROOT_DIR + "/brain/mediaext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Doc = require(ROOT_DIR + "/models/doc");

module.exports = Media = Object.assign({}, Doc);

// DEFINES

Media.Schema = new _mongoose.Schema({
    id : {type:String, unique:true},
    path : String,
    type : String,

    since : {type:Date, default:Date.now()},
    lastscrap : Date,

    creation : Date,
    author : String,
    email : String,
    site : String,
    copyright : String,
    orientation : String,
    height : Number,
    width : Number,
    model : String,
    modelserial : String,
    focal : Number,
    lens : String,
    wb : String,
    xres : Number,
    yres : Number,
    iso : Number,
    ex : Number,
    fn : Number,
    dominant : [],

    title : String,
    caption : String,
    tags : [String],

    altitude : Number,
    latitude : [],
    longitude : [],
    city : String,
    state : String,
    country : String,
    countrycode : String,

    authorrating : Number,
    publicrating : Number,
    ratingcount : Number,
    showcount : Number,
}, { strict: true });

Media.DB = _mongoose.model("Media", Media.Schema);

Media.ERROR = System.registerErrors({
    MEDIA_PARAMS : "Missing required params",
    MEDIA_NODIR : "No directory",
    MEDIA_MISSINGTYPE : "Can not identify the media type"
});

Media.MESSAGE = System.registerMessages({
    MEDIA_SUCCESS : "Operation success"
});

Media.READEDFILES = ["jpg"];



// PUBLIC

Media.ScrapDir = function (dir, callback) {
    var self = this;
    if(!dir)
        return System.callback(callback, [E(Media.ERROR.MEDIA_PARAMS), null]);

    dir = _path.normalize(dir);
    var dirmaster = _path.normalize(_path.join(dir, MediaExt.VERSIONAMSTER));
    if(!JsExt.isDir(dirmaster))
        return System.callback(callback, [E(Media.ERROR.MEDIA_NODIR), null]);

    var files = JsExt.listDir(dirmaster, self.READEDFILES);
    if(!files || files.length == 0)
        return System.callback(callback, [null, files]);

    var medias = {};
    var error = [];
    var pending = 0;
    files.forEach(function(file, index, arr) {
        pending++;
        Media.RGS(file, dir, dirmaster, function(err, savedMedia) {
            if(err) error.push(err);
            if(savedMedia && savedMedia.id) medias[savedMedia.id] = savedMedia;

            if(--pending <= 0) response(callback, error, medias);
        });
    });
}

Media.RGS = function (file, dir, dirmaster, callback) {
    var self = this;
    dir = _path.normalize(dir);
    var fileinput = _path.normalize(_path.join(dirmaster, file));
    MediaExt.readFile(fileinput, function(err, mediainfo) {
        if(err || !mediainfo) return response(callback, err, mediainfo);

        var stockinfo = mediainfo;
        stockinfo.path = dir;
        stockinfo.lastscrap = Date.now();

        MediaExt.generateVersions(dir, file, function(err, versions) {
            if(err) return response(callback, err, mediainfo);

            self.StockInfo(stockinfo, function(err, savedMedia) {
                return response(callback, err, savedMedia && savedMedia._doc);
            });
        });
    });
}

Media.StockInfo = function (media, callback) {
    var self = this;
    self.Create(media, function(err, savedMedia) {
        if(err && err.code != 11000)
            return response(callback, err, null);

        if(err && err.code == 11000)
            return self.Update(media, callback);

        return response(callback, null, savedMedia);
    });
}

Media.Create = function(media, callback) {
    var self = this;
    if(!media || !media.id)
        return System.callback(callback, [E(Media.ERROR.DOC_PARAMS, media), null]);

    var newmedia = Object.assign(new self.DB(), {
        since : Date.now(),
        showcount : 0,
        authorrating : 0,
        publicrating : 0,
        ratingcount : 0,
    }, media);

    newmedia.save(callback);
}



// PRIVATE

function response (callback, err, data) {
    return System.callback(callback, [err && err.length ? err : null, data]);
} 