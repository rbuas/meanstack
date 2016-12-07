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
    var type = req.params.type;
    var category = req.params.category;

    var response = {};
    if(!type) {
        response.error = E(Media.ERROR.MEDIA_PARAMS, {type:type, category:category});
        res.json(response);
        return;
    }

    var where = {category:category};

    var typeclass = null;
    switch(type) {
        case(Album.TYPE): typeclass = Album; break;
        case(Gallery.TYPE): typeclass = Gallery; break;
        case(Collection.TYPE): typeclass = Collection; break;
        default: 
            typeclass = Collection;
            where.$or = [{type : Album.TYPE}, {type : Collection.TYPE}, {type : Gallery.TYPE}];
            break;
    }
    if(!typeclass) {
        response.error = E(Media.ERROR.MEDIA_MISSINGTYPE);
        res.json(response);
        return;
    }

    typeclass.FindByUser(where, req, function(err, library) {
        if(err) {
            Log.message("error in search for ", type, library);
            response.error = err;
        } else {
            response.success = Media.MESSAGE.MEDIA_SUCCESS;
            response.library = library;
        }
        res.json(response);
    });
}

MediaRoute.album = function(req, res) {
    var album = req.params.album;
    var where = album ? {} : {id:album};

    Album.FindByUser(where, req, function(err, library) {
        if(err) {
            Log.message("error in search for ", type, library);
            response.error = err;
        } else {
            response.success = Media.MESSAGE.MEDIA_SUCCESS;
            if(album && library.length >= 1)
                response.album = library[0];
            else
                response.library = library;
        }
        res.json(response);
    });
}

MediaRoute.collection = function(req, res) {
    var collection = req.params.collection;
    var where = collection ? {} : {id:collection};

    Collection.FindByUser(where, req, function(err, library) {
        if(err) {
            Log.message("error in search for ", type, library);
            response.error = err;
        } else {
            response.success = Media.MESSAGE.MEDIA_SUCCESS;
            if(collection && library.length >= 1)
                response.collection = library[0];
            else
                response.library = library;
        }
        res.json(response);
    });
}

MediaRoute.gallery = function(req, res) {
    var gallery = req.params.gallery;
    var where = gallery ? {} : {id:gallery};

    Gallery.FindByUser(where, req, function(err, library) {
        if(err) {
            Log.message("error in search for ", type, library);
            response.error = err;
        } else {
            response.success = Media.MESSAGE.MEDIA_SUCCESS;
            if(gallery && library.length >= 1)
                response.gallery = library[0];
            else
                response.library = library;
        }
        res.json(response);
    });
}

MediaRoute.media = function(req, res) {
    var media = req.params.media;
    var ext = req.params.ext;
    var user = User.VerifyLogged(req);
    //TODO test referer
    //TODO
}

MediaRoute.create = function (req, res) {}
MediaRoute.remove = function (req, res) {}
MediaRoute.update = function (req, res) {}