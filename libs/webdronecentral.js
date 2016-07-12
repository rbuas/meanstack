var _log = require("./log");
var _http = require("http");

var _defaultoptions = {
    //updatestats : function(newstats, stats)
    sitemap : "../sitemap.json"
};

module.exports.WebDroneCentral = WebDroneCentral;

function WebDroneCentral (options) {
    var self = this;

    self.options = Object.assign(_defaultoptions, options) || {};

    self.stats = {};
    self.loadSitemap();
}
WebDroneCentral.prototype = {
    loadSitemap: function() {
        var self = this;
        self.sitemap = require(self.options.sitemap);
    },

    analyse : function(linklist, loadcharge) {
        var self = this;
        listlink = listlink || self.sitemap;
        if(!linklist)
            return;

        for(var l in linklist) {
            if(!linklist.hasOwnProperty(l))
                continue;

            var link = linklist[l];
            self.analyseLink(link, loadcharge);
        }
    },

    analyseLink : function (link, loadcharge, callback) {
        var self = this;
        if(!link)
            return;

        loadcharge = loadcharge || 1;
        self.stats[link] = self.stats[link] || startStats();
        var linkstats = self.stats[link];
        var pendding = loadcharge;

        for(var i = 0 ; i < loadcharge; i++) {
            var startTime = new Date();

            _http.get({host:link}, function(res) {
                res.on("data", function(d) {
                });
                res.on("end", function() {
                    var duration = new Date() - startTime;
                    var newstats = stockStats(linkstats, res, duration);
                    if(newstats) sendUpdateStats(self, newstats);

                    pendding--;
                    if(pendding == 0 && callback) callback(newstats);
                });
            }).on("error", function(error) {
                pendding--;
                if(pendding == 0 && callback) callback(error);
            });
        }
    }
}

function startStats () {
    return {
        load : []
    };
}

function stockStats (stats, res, duration) {
    if(!stats) {
        _log.error("Missing stats object to stock info into it");
        return false;
    }

    var newstats;
    if(!res || typeof(res) == "string") {
        newstats = {
            error : res || "unknwon error", 
            duration : duration
        };
    } else {
        newstats = {
            statusCode : res.statusCode,
            statusMessage : res.statusMessage,
            complete : res.complete,
            duration : duration,
            cacheControl : res.headers && res.headers["cache-control"],
            contentType : res.headers && res.headers["content-type"],
            connection : res.headers && res.headers["connection"],
            contentLength : res.headers && res.headers["content-length"]
        };
    }

    stats.load.push(newstats);
    return newstats;
}

function sendUpdateStats (self, newstats) {
    if(!self) {
        _log.error("Missing main object");
        return;
    }
    if(self.updatestats) self.updatestats(newstats, self.stats);
}