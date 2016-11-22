var Log = require(ROOT_DIR + "/brain/log");
var Media = require(ROOT_DIR + "/models/media");
var Collection = require(ROOT_DIR + "/models/collection");
var Gallery = require(ROOT_DIR + "/models/gallery");
var Album = require(ROOT_DIR + "/models/album");
var User = require(ROOT_DIR + "/models/user");

module.exports = MediaRoute = {};

MediaRoute.library = function(req, res) {
    var library = req.params.library;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}

MediaRoute.album = function(req, res) {
    var album = req.params.album;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}

MediaRoute.collection = function(req, res) {
    var collection = req.params.collection;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}

MediaRoute.gallery = function(req, res) {
    var gallery = req.params.gallery;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}

MediaRoute.midia = function(req, res) {
    var midia = req.params.midia;
    var ext = req.params.ext;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}