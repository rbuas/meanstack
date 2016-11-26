var _mongoose = require("mongoose");
var _moment = require("moment");
var _path = require("path");
var _fs = require("fs");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Doc = require(ROOT_DIR + "/models/doc");

module.exports = Media = Object.assign({}, Doc);

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
    showcount : Number,
}, { strict: true });

Media.DB = _mongoose.model("Media", Media.Schema);

Media.ERROR = System.registerErrors({
    MEDIA_PARAMS : "Missing required params",
    MEDIA_NODIR : "No directory",
});

Media.VERSIONAMSTER = "web";
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
    var dirmaster = _path.normalize(_path.join(dir, self.VERSIONAMSTER));
    if(!JsExt.isDir(dirmaster))
        return System.callback(callback, [E(Media.ERROR.MEDIA_NODIR), null]);

    var files = JsExt.listDir(dirmaster, self.READEDFILES);
    if(!files || files.length == 0)
        return System.callback(callback, [null, files]);

    var medias = {};
    var error = null;
    files.forEach(function(file, index, arr) {
        var info = self.ReadInfo(dirmaster, file);
        var versions = self.GenerateVersions(dir, file);
        pending++;
        self.StockInfo(info, function(err, savedMedia) {
            error = error || err;
            if(err || !savedMedia || !savedMedia.id)
                return;

            medias[savedMedia.id] = savedMedia;
            if(--pending <= 0) System.callback(callback, [error, medias]);
        });
    });
}

Media.ReadInfo = function (dir, file) {
    if(!dir || !file)
        return;

    var filepath = _path.normalize(_path.join(dir, file));
    var extension = _path.extname(filepath);
    var filetype = extension.replace(".", "");
    var fileid = _path.basename(filepath, extension);
    var filedir = _path.dirname(filepath);

    var stats = _fs.statSync(filepath);
    var since = stats.birthtime;

    //TODO read exif info

    return {
        path : filedir,
        id : fileid,
        type : filetype,
        since : since
    };
}

Media.GenerateVersions = function (dir, file) {
    var self = this;
    if(!dir || !file)
        return;

    var filepath = _path.normalize(_path.join(dir, self.VERSIONAMSTER, file));

    var versions = [];
    for(var version in self.VERSIONS) {
        if(!self.VERSIONS.hasOwnProperty(version)) continue;

        var config = self.VERSIONS[version];
        if(!config) continue;

        var destination = _path.normalize(_path.join(dir, version));
        if(self.GenerateVersion(filepath, config, destination))
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

Media.Create = function(media, callback) {
    var self = this;
    if(!media || !media.id)
        return System.callback(callback, [E(Media.ERROR.DOC_PARAMS, media), null]);

    var newmedia = new self.DB();
    newmedia.since = media.since || Date.now();
    newmedia.showcount = 0;
    newmedia.id = media.id;
    newmedia.content = media.content;
    newmedia.authorrating = 0;
    newmedia.publicrating = 0;
    newmedia.ratingcount = 0;

    newmedia.save(callback);
}