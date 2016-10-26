var _http = require("http");
var _cheerio = require("cheerio");
var _querystring = require("querystring");

var Log = require(ROOT_DIR + "/brain/log");
var JsExt = require(ROOT_DIR + "/brain/jsext");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;

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

        self.request({
                path:link.path,
                port:link.port,
                hostname:link.hostname
            }, 
            function(err, reqinfo, data) {
                var newstats;
                if(!err && data) {
                    var scrapinfo = getScrapInfos(data);
                    newstats = stockStats(linkstats, link, reqinfo, scrapinfo);
                    if(newstats) sendUpdateStats(self, newstats);
                }

                pendding--;
                if(pendding == 0 && endCallback) endCallback(data, newstats);
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

WebDroneScraper.prototype.sitemap = function (config) {
    var self = this;
    var mapfile = config.mapfile;//"../sitemap.json" 
    var hostname = config.hostname;
    var port = config.port; 
    var eachCallback = config.eachCallback; 
    var endCallback = config.endCallback;
    if(!mapfile) {
        if(endCallback) endCallback();
        return;
    }

    self.mapfile = mapfile;
    self.sitemap = require(self.mapfile);
    if(!self.sitemap) {
        Log.error("Can not load sitemap from : " + mapfile);
        if(endCallback) endCallback();
        return;
    }

    var sitemaplinks = [];
    for(var path in self.sitemap) {
        if(!self.sitemap.hasOwnProperty(path))
            continue;

        sitemaplinks.push({hostname:hostname, port:port, path:path});
    }

    if(sitemaplinks.length == 0) {
        Log.message("No links into sitemap");
        if(endCallback) endCallback();
        return;
    }

    return self.scrap(sitemaplinks, eachCallback, endCallback);
}

WebDroneScraper.prototype.getStatsUrl = function (stats) {
    if(!stats || !stats.link)
        return;

    var url = stats.link.hostname || stats.link.host || "";
    if(stats.link.port) {
        url += ":" + stats.link.port;
    }
    url += stats.link.path;
    return url;
}

WebDroneScraper.prototype.request = function (options, callback) {
    var self = this;
    if(!options)
        return;

    var method = options.method || "GET";
    var path = options.path;
    var dataString = JSON.stringify(options.data);
    var info = {
        request : {
            method : method,
            //port : options.port || self.options.port,
            path : path || "/",
            hostname : options.hostname || self.options.urlbase,
            headers : {}
        }
    };
    if(method == "GET") {
        var querystring = _querystring.stringify(options.data);
        info.request.path = JsExt.buildUrl(path, querystring);
    } else if(method == "POST") {
        info.request.headers['Content-Type'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
        info.request.headers['Connection'] = 'keep-alive';
        info.request.headers['Content-Length'] = dataString && dataString.length || 0;
        info.request.json = true;
    }

    if(options.keepsession) {
        if(options.sessionCookie) info.request.headers['Cookie'] = options.sessionCookie;
        info.request.headers["Connection"] = "keep-alive";
        info.request.agent = new _http.Agent({
            maxSockets: 1,
            timeout: 60000,
            keepAliveTimeout: 30000
        });
    }

    info.startTime = new Date();
    var request = _http.request(info.request, function(res) {
        var data = "";
        res.setEncoding('utf8');
        info.headers = res.headers;
        if(options.keepsession) {
            var cookie = res.headers["set-cookie"];
            options.sessionCookie = cookie && cookie.length > 0 && cookie[0];
        }
        res.on("data", function(d) {
            data += d;
        });
        res.on("end", function() {
            info.endTime = new Date();
            info.duration = info.endTime - info.startTime;
            info.statusCode = this.statusCode;
            info.statusMessage = this.statusMessage;
            if(info.statusCode != 200) {
                var error = "status code error";
                if(callback) callback(error, info, null);
                return;
            }
            if(callback) callback(null, info, data);
        });
    }).on("error", function(error) {
        info.endTime = new Date();

        if(callback) callback(error, info, null);
    });

    if(dataString && method == "POST") {
        request.write(dataString);
    }

    request.end();
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
    var protocol = link.protocol || "";
    return (protocol ? protocol + "//" : "") + host + (port ? ":" + port : "") + path;
}

function stockStats (stats, link, info, scrapinfo) {
    if(!stats) {
        Log.error("Missing stats object to stock info into it");
        return false;
    }

    var newstats;
    if(!info || typeof(info) == "string") {
        newstats = {
            error : info || "unknwon error" 
        };
    } else {
        newstats = {
            link : link,
            statusCode : info.statusCode,
            statusMessage : info.statusMessage,
            complete : info.complete,
            duration : info.duration,
            cacheControl : info.headers && info.headers["cache-control"],
            contentType : info.headers && info.headers["content-type"],
            connection : info.headers && info.headers["connection"],
            contentLength : parseInt(info.headers && info.headers["content-length"]),
            scrapinfo : scrapinfo
        };
    }

    stats.load.push(newstats);
    return newstats;
}

function sendUpdateStats (self, newstats) {
    if(!self) {
        Log.error("Missing main object");
        return;
    }
    if(self.updatestats) self.updatestats(newstats, self.stats);
}

function getScrapInfos (data) {
    if(!data)
        return;

    var $ = _cheerio.load(data);
    if(!$)
        return;
    
    return {
        droneinfo : getDroneInfos($),
        title : getTitleInfo($)
    };
}

function getDroneInfos ($) {
    if(!$) return;
    var droneinfo = $("#webdrone");
    return droneinfo.text();
}

function getTitleInfo ($) {
    if(!$) return;
    var titleinfo = $("h1");
    return titleinfo.text();    
}