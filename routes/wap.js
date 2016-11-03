var Log = require(ROOT_DIR + "/brain/log");
var Wap = require(ROOT_DIR + "/models/wap");

module.exports = WapRoute = {};

WapRoute.list = function(req, res) {
    var state = req.params.state;
    var category = req.params.category;
    var type = req.params.type;

    var where = {};
    if(type && type != "*") where.type = type.split("|");
    if(category && category != "*") where.category = category.split("|");
    if(state && state != "*") where.state = state.split("|");
    Wap.Find(where, function(err, waps) {
        var response = {};
        if(err || !waps) {
            Log.message("wap.list failure", err);
            response.error = err;
        } else {
            Log.message("wap.list success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.waps = waps;
        }
        res.json(response);
    });
}

WapRoute.map = function(req, res) {
    var category = req.params.category;
    var type = req.params.type;

    var where = {state : Wap.STATE.PUBLIC};
    if(type && type != "*") where.type = type.split("|");
    if(category && category != "*") where.category = category.split("|");
    Wap.GetMap(where, function(err, waps) {
        var response = {};
        if(err || !waps) {
            Log.message("wap.map failure", err);
            response.error = err;
        } else {
            Log.message("wap.map success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.waps = waps;
        }
        res.json(response);
    });
}

WapRoute.create = function(req, res) {
    var wap = req.body.wap;
    Wap.Create(wap, function(err, savedWap) {
        var response = {};
        if(err || !savedWap) {
            Log.message("wap.list failure", err);
            response.error = err;
        } else {
            Log.message("wap.list success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedWap;
        }
        res.json(response);
    });
}

WapRoute.DraftGet = function(req, res) {
}

WapRoute.DraftStart = function(req, res) {
}

WapRoute.DraftStartEdition = function(req, res) {
}

WapRoute.DraftEndEdition = function(req, res) {
}

WapRoute.DraftReview = function(req, res) {
}

WapRoute.DraftReviewRepprove = function(req, res) {
}

WapRoute.DraftReviewApprove = function(req, res) {
}

WapRoute.DraftPublish = function(req, res) {
}

WapRoute.PublishScheduled = function(req, res) {

}