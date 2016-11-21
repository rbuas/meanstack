var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Wap = require(ROOT_DIR + "/models/wap");
var Media = require(ROOT_DIR + "/models/media");

module.exports = Album = Object.assign({}, Wap);

Album.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Album.TYPE = "ALBUM";
Album.GALLERY = "GALLERY";
Album.COLLECTION = "COLLECTION";

Album.GetLibrary = function (where, callback) {
    where.$or = [{type : Album.TYPE}, {type : Album.GALLERY}, {type : Album.COLLECTION}];
    return Wap.Find(where, callback);
}

Album.GetAlbums = function (where, callback) {
    where.type = Album.TYPE;
    return Wap.Find(where, callback);
}

Album.GetGalleries = function (where, callback) {
    where.type = Album.GALLERY;
    return Wap.Find(where, callback);
}

Album.GetCollections = function (where, callback) {
    where.type = Album.GALLERY;
    return Wap.Find(where, callback);
}

Album.GetData = function (id, callback) {
    var self = this;
    self.Get(id, function(err, savedAlbum) {
        if(err || !savedAlbum)
            return System.callback(callback, [err, savedAlbum]);

        Midia.Find({_id : {$in:savedAlbum.content}}, callback);
    });
}