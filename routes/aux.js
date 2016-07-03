module.exports.download = function(req, res) {
    res.download("./package.json", function() {
        console.log("download is over!");
    });
}

module.exports.stest = function(req, res) {
    var test = req.params.test || "";
    if(test) {
        if(req.session.test) {
            console.log("test already set : " + req.session.test + " -> " + test);
        }
        req.session.test = test;
    }
    var viewdata = {
        test: req.session.test, 
        city:null, 
        cityimages:0,
        layout:"pure"
    };
    res.render("session", viewdata);
}