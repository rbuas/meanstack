var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Wap = require(ROOT_DIR + "/models/wap");
var Media = require(ROOT_DIR + "/models/media");

module.exports = Collection = Object.assign({}, Wap);

Collection.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Collection.TYPE = "COLLECTION";

Collection.Find = function (where, callback) {
    var self = this;
    where.type = self.TYPE;
    return Wap.Find(where, callback);
}

Collection.GetData = function (id, callback) {
    var self = this;
    self.Get(id, function(err, savedAlbum) {
        if(err || !savedAlbum)
            return System.callback(callback, [err, savedAlbum]);

        Midia.Find({_id : {$in:savedAlbum.content}}, callback);
    });
}