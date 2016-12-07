var _mongoose = require("mongoose");
var _moment = require("moment");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Wap = require(ROOT_DIR + "/models/wap");
var Media = require(ROOT_DIR + "/models/media");
var User = require(ROOT_DIR + "/models/user");

module.exports = Collection = Object.assign({}, Wap);

Collection.ERROR = System.registerErrors({
    //WAP_PARAMS : "Missing required params"
});

Collection.TYPE = "COLLECTION";

Collection.Find = function (where, callback) {
    var self = this;
    where.type = where.type || self.TYPE;
    return Wap.Find(where, callback);
}

Collection.FindByUser = function (where, req, callback) {
    var self = this;
    where = self.AssertSearchByUser(req);
    return self.Find(where, callback);
}

Collection.GetData = function (id, callback) {
    var self = this;
    self.Get(id, function(err, savedAlbum) {
        if(err || !savedAlbum)
            return System.callback(callback, [err, savedAlbum]);

        Midia.Find({_id : {$in:savedAlbum.content}}, callback);
    });
}

Collection.AssertSearchByUser = function (req, where) {
    where = where || {};
    var whereout = {};
    var user = User.VerifyLogged(req);
    if(User.VerifyProfile(req, User.PROFILE.ADMIN)) {
        if(!where.status) {
            whereout = { $and : [
                where,
                { $or : [{status : Wap.STATUS.PUBLIC}, {status : Wap.STATUS.PRIVATE}, {state : Wap.STATE.SCHEDULED}] }
            ]};
        }
    } else if (user) {
        //TODO
    }
    else {
        where.status = Wap.STATUS.PUBLIC;
    }
    return whereout;
}