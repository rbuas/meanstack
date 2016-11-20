var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Wap = require(ROOT_DIR + "/models/wap");

module.exports = Album = Object.assign({}, Wap);

Album.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});