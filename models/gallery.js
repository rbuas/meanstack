var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Collection = require(ROOT_DIR + "/models/collection");
var Media = require(ROOT_DIR + "/models/media");

module.exports = Gallery = Object.assign({}, Collection);

Gallery.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Gallery.TYPE = "GALLERY";