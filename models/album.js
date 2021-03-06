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

Album.Scrap = function (albumid, callback) {
    var self = this;
    self.Get(albumid, function(err, savedAlbum) {
        if(err || !savedAlbum)
            return System.callback(callback, [err, null]);

        var scrapresult = Media.ScrapDir(savedAlbum.path, function(err, medias) {
            if(err || !medias) return System.callback(callback, [err, medias]);

            savedAlbum.content = Object.keys(medias);
            savedAlbum.save(callback);
        });
    });
}