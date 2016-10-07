var _http = require("http");
var _cheerio = require("cheerio");


module.exports = TestRouteApi;

function TestRouteApi (options) {
    var self = this;
    self.options = Object.assign(TestRouteApi.defaultoptions, options) || {};
}

TestRouteApi.defaultoptions = {};


TestRouteApi.prototype.get = function (link, data, callback) {
    var self = this;
    if(!link)
        return;

    var startTime = new Date();
    _http.get(link, function(res) {
        var data = "";
        res.on("data", function(d) {
            data += d;
        });
        res.on("end", function() {
            var duration = new Date() - startTime;

            if(callback) callback(null, data, newstats);
        });
    }).on("error", function(error) {
        if(callback) callback(error);
    });
}