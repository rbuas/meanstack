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
            Log.message("waps.list failure", err);
            response.error = err;
        } else {
            Log.message("quote.list success");
            response.success = Wap.MESSAGE.WAP_SUCCESS;
            response.waps = waps;
        }
        res.json(response);
    });
}