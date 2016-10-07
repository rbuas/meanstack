var _http = require("http");
var _cheerio = require("cheerio");

var _log = require("./log");

module.exports = WebDroneScraper;

function WebDroneScraper (options) {
    var self = this;

    self.options = Object.assign(WebDroneScraper.defaultoptions, options) || {};

    self.stats = {};
}

WebDroneScraper.defaultoptions = {};

WebDroneScraper.prototype.scrapLink = function (link, endCallback, loadcharge) {
    var self = this;
    if(!link)
        return;

    loadcharge = loadcharge || 1;
    var statsid = generatStatsId(link);
    self.stats[statsid] = self.stats[statsid] || startStats();
    var linkstats = self.stats[statsid];
    var pendding = loadcharge;

    for(var i = 0 ; i < loadcharge; i++) {
        var startTime = new Date();

        _http.get(link, function(res) {
            var data = "";
            res.on("data", function(d) {
                data += d;
            });
            res.on("end", function() {
                var duration = new Date() - startTime;
                var droneinfo = getDroneInfos(data);
                var newstats = stockStats(linkstats, link, res, duration, droneinfo);
                if(newstats) sendUpdateStats(self, newstats);

                pendding--;
                if(pendding == 0 && endCallback) endCallback(data, newstats);
            });
        }).on("error", function(error) {
            pendding--;
            if(pendding == 0 && endCallback) endCallback(error);
        });
    }
}

WebDroneScraper.prototype.scrap = function (list, eachCallback, endCallback) {
    var self = this;
    if(!list) {
        if(endCallback) endCallback();
        return;
    }

    list = (list instanceof Array) ? list : [list];

    var pendding = list.length;

    for(var l in list) {
        if(!list.hasOwnProperty(l))
            continue;

        var target = list[l];
        self.scrapLink(target, function(data, newstats) {
            if(target.callback) target.callback(data, newstats);
            if(eachCallback) eachCallback(data, newstats);
            if(--pendding == 0 && endCallback) endCallback(data, newstats);
        });
    }
}

WebDroneScraper.prototype.sitemap = function (mapfile, host, port, eachCallback, endCallback) { //"../sitemap.json"
    var self = this;
    if(!mapfile) {
        if(endCallback) endCallback();
        return;
    }

    self.mapfile = mapfile;
    self.sitemap = require(self.mapfile);
    if(!self.sitemap) {
        _log.error("Can not load sitemap from : " + mapfile);
        if(endCallback) endCallback();
        return;
    }

    var sitemaplinks = [];
    for(var path in self.sitemap) {
        if(!self.sitemap.hasOwnProperty(path))
            continue;

        sitemaplinks.push({host:host, port:port, path:path});
    }

    if(sitemaplinks.length == 0) {
        _log.message("No links into sitemap");
        if(endCallback) endCallback();
        return;
    }

    return self.scrap(sitemaplinks, eachCallback, endCallback);
}


// PRIVATE

function startStats () {
    return {
        load : []
    };
}

function generatStatsId (link) {
    if(!link)
        return "?";

    var host = link.host || "";
    var port = link.port || "";
    var path = link.path || "";
    var method = link.method || "";
    return (method ? method + "::" : "") + host + (port ? ":" + port : "") + path;
}

function stockStats (stats, link, res, duration, droneinfo) {
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
            link : link,
            statusCode : res.statusCode,
            statusMessage : res.statusMessage,
            complete : res.complete,
            duration : duration,
            cacheControl : res.headers && res.headers["cache-control"],
            contentType : res.headers && res.headers["content-type"],
            connection : res.headers && res.headers["connection"],
            contentLength : res.headers && res.headers["content-length"],
            droneinfo : droneinfo
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

function getDroneInfos (data) {

    var $ = _cheerio.load(data);
    var droneinfo = $("#webdrone");
    return droneinfo.text();
}