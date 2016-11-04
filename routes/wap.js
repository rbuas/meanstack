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

WapRoute.get = function(req, res) {
    var wapid = req.params.wapid;
    var state = req.params.state;
    state = state && state.toUpperCase();

    if(Wap.IsDraft(state)) {
        Wap.DraftGet(wap, function(err, savedWap) {
            var response = {};
            if(err || !savedWap) {
                Log.message("wap.get failure", err);
                response.error = err;
            } else {
                Log.message("wap.get success");
                response.success = Wap.MESSAGE.WAP_SUCCESS;
                response.wap = savedWap;
            }
            res.json(response);
        });
    } else {
        Wap.Get(wap, function(err, savedWap) {
            var response = {};
            if(err || !savedWap) {
                Log.message("wap.get failure", err);
                response.error = err;
            } else {
                Log.message("wap.get success");
                response.success = Wap.MESSAGE.WAP_SUCCESS;
                response.wap = savedWap;
            }
            res.json(response);
        });
    }
}

WapRoute.update = function(req, res) {
    var wap = req.body.wap;
    if(wap) delete(wap.state);
    Wap.Update(wap, function(err, savedWap) {
        var response = {};
        if(err || !savedWap) {
            Log.message("wap.update failure", err);
            response.error = err;
        } else {
            Log.message("wap.update success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedWap;
        }
        res.json(response);
    });
}

WapRoute.draftstart = function(req, res) {
    var userid = req.body.userid;
    var wap = req.body.wap;
    Wap.DraftStart(wap, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.get failure", err);
            response.error = err;
        } else {
            Log.message("wap.get success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftedit = function(req, res) {
    var userid = req.body.userid;
    var wapid = req.body.wapid;
    Wap.DraftStartEdition(wapid, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftedit failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftedit success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftclose = function(req, res) {
    var userid = req.body.userid;
    var wapid = req.body.wapid;
    Wap.DraftEndEdition(wapid, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftclose failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftclose success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftreview = function(req, res) {
    var userid = req.body.userid;
    var wapid = req.body.wapid;
    Wap.DraftReview(wapid, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftreview failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftreview success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftrepprove = function(req, res) {
    var userid = req.body.userid;
    var wapid = req.body.wapid;
    Wap.DraftReviewRepprove(wapid, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftrepprove failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftrepprove success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftapprove = function(req, res) {
    var userid = req.body.userid;
    var wapid = req.body.wapid;
    Wap.DraftReviewApprove(wapid, userid, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftapprove failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftapprove success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}

WapRoute.draftpublish = function(req, res) {
    var publicdate = req.body.publicdate;
    var wapid = req.body.wapid;
    Wap.DraftPublish(wapid, publicdate, function (err, savedDraft) {
        var response = {};
        if(err || !savedDraft) {
            Log.message("wap.draftpublish failure", err);
            response.error = err;
        } else {
            Log.message("wap.draftpublish success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.wap = savedDraft;
        }
        res.json(response);
    });
}