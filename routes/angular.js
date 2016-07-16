module.exports.basic = function(req, res) {
    var viewdata = {
        metatitle: "angular test one",
        layout: "angular"
    };
    res.render("angular", viewdata);
}