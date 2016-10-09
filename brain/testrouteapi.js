var _http = require("http");
var _cheerio = require("cheerio");
var _querystring = require("querystring");

var JsExt = require("../brain/JsExt");
var System = require("../brain/system");
var E = System.error;

module.exports = TestRouteApi;

function TestRouteApi (options) {
    var self = this;
    self.options = Object.assign(TestRouteApi.defaultoptions, options) || {};
}

TestRouteApi.defaultoptions = { urlbase : "localhost", port : 8080};

TestRouteApi.ERROR = System.registerErrors({
    TEST_JSONPARSE : "Can not parse json data"
});


/**
 * request
 * 
 * @param options Object : {
 *      method string Request method, default is GET
 *      path string Link to test
 *      data object Parameters dictionary ( key = value )
 * }
 * callback function Callback params (error, duration, responsedata)
 */
TestRouteApi.prototype.request = function (options, callback) {
    var self = this;
    if(!options)
        return;

    var method = options.method || "GET";
    var querystring = _querystring.stringify(options.data);
    var path = method == "GET" ? options.path + querystring : options.path;
    var info = {
        startTime : new Date(),
        request : {
            method : method,
            port : options.port || self.options.port,
            path : path || "/",
            hostname : options.hostname || self.options.urlbase
        }
    };
    if(method == "POST") {
        info.request.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(querystring)
        }
    }
    var request = _http.request(info.request, function(res) {
        var data = "";
        res.setEncoding('utf8');
        info.headers = res.headers;
        res.on("data", function(d) {
            data += d;
        });
        res.on("end", function() {
            info.endTime = new Date();
            info.duration = info.endTime - info.startTime;
            info.statusCode = this.statusCode;
            info.statusMessage = this.statusMessage;
            try {
                var parsed = JSON.parse(data);
            } catch (err) {
                var error = E(TestRouteApi.ERROR.TEST_JSONPARSE, err);
                if(callback) callback(error, info, null);
                return;
            }
            if(callback) callback(null, info, parsed);
        });
    }).on("error", function(error) {
        info.endTime = new Date();
        info.duration = info.endTime - info.startTime;

        if(callback) callback(error, info, null);
    });

    if(method == "POST") {
        request.write(querystring);
    }

    request.end();
}