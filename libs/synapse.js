module.exports.Synapse = Synapse;

var _bodyparser = require("body-parser");
var _express = require("express");
var _defaultoptions = {
    port : 8080,
    address : "localhost",
    startmessage:"Synapse active at ",
    rootDir: "",
    publicDir: "/public",
    viewsDir : "/skeletons",
    routes : [
        {path:"/", res:"index.html", method:"get"}
    ]
};
console.assert(_express, "ERROR: can not import express module")


function Synapse (options) {
    this.options = Object.assign(_defaultoptions, options);

    this.app = _express();
    console.assert(this.app, "ERROR: can not create app from express");

    var publicpath = this.path(this.options.publicDir); 
    this.app.use(_express.static(publicpath));
    console.log("Public files : ", publicpath);

    this.app.use(_bodyparser.json());
    this.app.use(_bodyparser.urlencoded({ extended: false }));

    this.routing();
    this.listen();
}
Synapse.prototype = {
    path : function(rel) {
        var root = this.options.rootDir || "";
        var relout = rel || "";
        return root + rel;
    },

    routing : function() {
        var routes = this.options.routes;
        var _this = this;

        if(!routes)
            return;

        for(var r in routes) {
            if(!routes.hasOwnProperty(r))
                continue;

            var route = routes[r];
            if(!route || !route.path || !route.res) {
                console.warn("WARNING: missing parameters in routes table", route);
                continue;
            }

            if(route.method == "post") { // POST METHOD
                //TODO
            } else { // GET METHOD
                this.app.get(route.path, function(request, response) {
                    var filename = _this.skeleton(route.res);
                    console.log("GET: " + filename);
                    response.sendFile(filename);
                });
            }
        }
    },

    listen : function() {
        var port = this.options.port || 3000;
        var startmessage = this.options.startmessage || "";
        var address = this.options.address || "";

        return this.app.listen(port, function(request, response) {
            var message = !port ? startmessage + address : startmessage + address + ":" + port;
            console.log(message);
        });
    },

    skeleton : function(res) {
        if(!res)
            return;

        var views = this.options.viewsDir || "";
        var root = this.options.rootDir || "";

        return root + views + "/" + res;
    }
};