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
}, { strict: true });

Media.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Media.VERSIONS = {
    web : {quality : 100, width : 2048},
    low : {quality : 100, width : 1024},
    mob : {quality : 100, width : 480},
    thumb : {quality : 60, width : 120}
};

Media.ScrapDir = function (dir) {
    //TODO
}

Media.ReadInfo = function (filepath) {
    //TODO
}

Media.GenerateVersion = function (version) {
    var self = this;
    if(!version)
        return;

    var config = self.VERSIONS[version];
    if(!config)
        return;

    //TODO generate version with config.quality et config.width 
}

Media.StockInfo = function (midia, callback) {
    var self = this;
    self.Create(media, function(err, savedMedia) {
        if(err && err.code != 11000)
            return System.callback(callback, [err, null]);

        if(err && err.code == 11000)
            return self.Update(media, callback);

        return System.callback(callback, [null, savedMedia]);
    });
}