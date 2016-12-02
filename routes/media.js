var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Log = require(ROOT_DIR + "/brain/log");
var Media = require(ROOT_DIR + "/models/media");
var Collection = require(ROOT_DIR + "/models/collection");
var Gallery = require(ROOT_DIR + "/models/gallery");
var Album = require(ROOT_DIR + "/models/album");
var User = require(ROOT_DIR + "/models/user");

module.exports = MediaRoute = {};

MediaRoute.albums = function(req, res) {
    var category = req.params.category || "";
    category = category.split("|");

    var where = {status:Wap.STATUS.PUBLIC};
    if(User.VerifyProfile(req, User.PROFILE.ADMIN))
        where = { $or : [{status : Wap.STATUS.PUBLIC}, {status : Wap.STATUS.PRIVATE}, {state : Wap.STATE.SCHEDULED}] };

    if(category)
        where.category 

    Album.Find(where, function(err, albums) {
        var response = {};
        if(err) {
            Log.message("error in search for albums", albums);
            response.error = err;
        } else {
            response.albums = albums;
        }
        res.json(response);
    });
}

MediaRoute.album = function(req, res) {
    var album = req.params.album;
    var user = User.VerifyLogged(req);
    //TODO test referer
    Album.Find({id:album}, function(err, savedAlbum) {
        //TODO
    });
}

MediaRoute.collection = function(req, res) {
    var collection = req.params.collection;
    var user = User.VerifyLogged(req);
    //TODO test referer
    Collection.Find({id:collection}, function(err, savedAlbum) {
        //TODO
    });
}

MediaRoute.gallery = function(req, res) {
    var gallery = req.params.gallery;
    var user = User.VerifyLogged(req);
    //TODO test referer
    Collection.Find({id:gallery}, function(err, savedAlbum) {
        //TODO
    });
}

MediaRoute.midia = function(req, res) {
    var midia = req.params.midia;
    var ext = req.params.ext;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}