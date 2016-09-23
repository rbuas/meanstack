var _log = require("../brain/log");

module.exports.startpage = function(req, res) {
    var viewdata = {
        metatitle: "angular test one",
        layout: "angular"
    };
    res.render("angular", viewdata);
}

module.exports.connect = function(req, res) {
    _log.message("Connection start");
    var response = {
        session : req.session
    };
    res.json(response);
}