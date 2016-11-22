var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Collection = require(ROOT_DIR + "/models/collection");
var Media = require(ROOT_DIR + "/models/media");

module.exports = Album = Object.assign({}, Collection);

Album.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Album.TYPE = "ALBUM";

// Album.GetLibrary = function (where, callback) {
//     where.$or = [{type : Album.TYPE}, {type : Album.GALLERY}, {type : Album.COLLECTION}];
//     return Wap.Find(where, callback);
// }

Album.Scrap = function (albumid, callback) {
    var self = this;
    self.Get(albumid, function(err, savedAlbum) {
        if(err || !savedAlbum)
            return System.callback(callback, []); //TODO

        var scrapresult = Media.ScrapDir(savedAlbum.path);
        savedAlbum.content = scrapresult;
        savedAlbum.save(callback);
    });
}