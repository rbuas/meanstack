var _curl = require("node-libcurl").Curl;
var _log = require("./log");

var _defaultoptions = {
    //updatestats : function(newstats, stats) 
};

module.exports.WebDroneCentral = WebDroneCentral;

function WebDroneCentral (options) {
    var self = this;

    self.options = Object.assign(_defaultoptions, options) || {};

    self.stats = {};
}
WebDroneCentral.prototype = {
    analyse : function(linklist, loadcharge) {
        var self = this;
        if(!linklist)
            return;

        for(var l in linklist) {
            if(!linklist.hasOwnProperty(l))
                continue;

            var link = linklist[l];
            self.analyseLink(link, loadcharge);
        }
    },

    analyseLink : function (link, loadcharge) {
        var self = this;
        if(!link)
            return;

        loadcharge = loadcharge || 1;
        self.stats[link] = self.stats[link] || startStats;
        var linkstats = self.stats[link];

        for(var i = 0 ; i < loadcharge; i++) {
            var curl = new _curl();
            curl.setOpt( "URL", link );
            curl.setOpt( "FOLLOWLOCATION", true );
            curl.on("end", function(statusCode, body, headers) {
                var newstats = stockStats(linkstats, statusCode, body, headers, data);
                if(newstats) sendUpdateStats(self, newstats);
                this.close();
            });
        }
    }
}

function startStats () {
    return {
        load : []
    };
}

function stockStats (stats, statusCode, body, headers, data) {
    if(!stats) {
        _log.error("Missing stats object to stock info into it");
        return false;
    }

    var newstats = {
        size : body.length,
        loadtime : data.getInfo( 'TOTAL_TIME' ),
        status : statusCode
    };
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