var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Log = require(ROOT_DIR + "/brain/log");
var Media = require(ROOT_DIR + "/models/media");
var Collection = require(ROOT_DIR + "/models/collection");
var Gallery = require(ROOT_DIR + "/models/gallery");
var Album = require(ROOT_DIR + "/models/album");
var User = require(ROOT_DIR + "/models/user");

module.exports = MediaRoute = {};

MediaRoute.library = function(req, res) {
    var library = req.params.library;
    var response = {};
    if(!User.VerifyProfile(req, User.PROFILE.ADMIN)) {
        Log.message("user not authorized user", req.session.user);
        response.error = E(User.ERROR.USER_NOTAUTHORIZED, req.session.user);
        res.json(response);
        return;
    }
    //TODO test referer
    //TODO
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