var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Doc = require(ROOT_DIR + "/models/doc");

module.exports = Media = Object.assign({}, Doc);

Media.Schema = new _mongoose.Schema({
    id : {type:String, unique:true},
    path : String,

    since : {type:Date, default:Date.now()},
    lastscrap : Date,
    showcount : Number,

    creation : Date,
    author : String,
    email : String,
    site : String,
    copyright : String,
    h : Number,
    w : Number,
    model : String,
    focal : Number,
    lens : String,
    wb : String,
    k : Number,
    xres : Number,
    yres : Number,
    iso : Number,
    ex : String,
    fn : Number,
    caption : String,
    tags : [String],

    latitude : String,
    longitude : String,
    city : String,
    region : String,
    country : String,

    authorrating : Number,
    publicrating : Number,
    ratingcount : Number,
}, { strict: true });

Media.ERROR = System.registerErrors({
    MEDIA_PARAMS : "Missing required params"
});

Media.VERSIONS = {
    web : {quality : 100, width : 2048},
    low : {quality : 100, width : 1024},
    mob : {quality : 100, width : 480},
    thumb : {quality : 60, width : 120}
};

Media.READEDFILES = ["jpg"];

Media.ScrapDir = function (dir, callback) {
    var self = this;
    if(!dir)
        return System.callback(callback, [E(Media.ERROR.MEDIA_PARAMS), null]);

    var pending = 0;
    var files = JsExt.listDir(dir, self.READEDFILES);
    var medias = {};
    var error = null;
    files.forEach(function(file, index, arr) {
        var info = self.ReadInfo(dir + "/" + file);
        var versions = self.GenerateVersions(dir, file);
        pending++;
        self.StockInfo(info, function(err, savedMedia) {
            medias[file] = savedMedia;
            error = error || err;
            if(--pending <= 0) System.callback(callback, [error, medias]);
        });
    });
    return System.callback(callback, [null, files]);
}

Media.ReadInfo = function (filepath) {
    if(!filepath)
        return;

    //TODO read exif info
}

Media.GenerateVersions = function (dir, file) {
    var self = this;
    if(!dir || !file)
        return;

    var filepath = dir + "/" + file;

    var versions = [];
    for(var version in self.VERSIONS) {
        if(!self.VERSIONS.hasOwnProperty(version)) continue;

        var config = self.VERSIONS[version];
        if(self.GenerateVersion(filepath, config, dir + "/" + config))
            versions.push(version);
    }
    return versions;
}

Media.GenerateVersion = function (filepath, config, destination) {
    var self = this;
    if(!filepath || !config || !destination)
        return false;

    //TODO generate version with config.quality et config.width
    return true; 
}

Media.StockInfo = function (media, callback) {
    var self = this;
    self.Create(media, function(err, savedMedia) {
        if(err && err.code != 11000)
            return System.callback(callback, [err, null]);

        if(err && err.code == 11000)
            return self.Update(media, callback);

        return System.callback(callback, [null, savedMedia]);
    });
}