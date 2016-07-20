var _bodyparser = require("body-parser");
var _express = require("express");
var _session = require("express-session");
var _exphbs  = require("express-handlebars");
var _mongoose = require("mongoose");
var _http = require("http");
var _socket = require("socket.io");

var _memory = require("./memory");
var _log = require("./log");

var _defaultoptions = {
    port : 3000,
    name : "",
    address : "localhost",
    rootDir: "",
    publicDir: "/public",
    viewsDir: "/views",
    encryptkey: "secret",
    viewEngine: null,
    db : null,
    routes : null
};
_log.assert(_express, "ERROR: can not import express module")

module.exports.Brain = Brain;

function Brain (options) {
    this.options = Object.assign(_defaultoptions, options) || {};
    this.options.routes = this.options.routes || [];

    this.app = _express();
    _log.assert(this.app, "ERROR: can not create app from express");

    this.server = _http.createServer(this.app);
    _log.assert(this.server, "ERROR: can not create server from http");

    this.socketio = _socket(this.server);
    _log.assert(this.socketio, "ERROR: can not start socket");

    _log.message("Brain " + (this.options.name || "") + " started");

    if(this.options.viewEngine) {
        var viewDir = this.path(this.options.viewsDir);
        this.app.set("views", viewDir);
        _log.message("Brain : set view path : ", viewDir);
        this.app.engine(this.options.viewEngine, _exphbs({
            defaultLayout: "master", 
            extname: ".html", 
            partialsDir: viewDir + "/partials/",
            layoutDir: viewDir + "/layouts/"
        }));
        this.app.set("view engine", this.options.viewEngine);
    }

    var publicpath = this.path(this.options.publicDir); 
    this.app.use(_express.static(publicpath));
    _log.message("Static files at ", publicpath);

    this.app.use(_bodyparser.json());
    this.app.use(_bodyparser.json({ type: 'application/vnd.api+json' })); 
    this.app.use(_bodyparser.urlencoded({extended:true}));
    this.app.use(_session({secret:this.options.encryptkey, resave : true, saveUninitialized : true}));

    this.memory = new _memory.Memory(this);

    this.synapsys();
    this.listen();
}

Brain.prototype = {
    synapsys : function() {
        var routes = this.options.routes;
        _log.assert(routes, "ERROR: missing routes to build synapsys.");

        for(var r in routes) {
            if(!routes.hasOwnProperty(r))
                continue;

            this.route(routes[r]);
        }
    },

    route : function(route) {
        if(!route || !route.path || !route.cb) {
            _log.warning("WARNING: missing parameters in routes table", route);
            return;
        }

        var method = route.method || "get";
        switch(method) {
            case "post": // POST METHOD
                _log.message("Prepare synapse (post): " + route.path);
                this.app.post(route.path, route.cb);
            break;

            case "get": // GET METHOD
                _log.message("Prepare synapse (get): " + route.path);
                this.app.get(route.path, route.cb);
            break;

            case "socket":
                _log.message("Prepare synapse (socket): " + route.path);
                this.socketio.on(route.path, route.cb);
            break;
        }
    },

    listen : function() {
        var port = this.options.port || 3000;
        var address = this.options.address || "";

        var self = this;
        return this.server.listen(port, function(request, response) {
            var message = "App active at " + address;
            if(port) message = message + ":" + port;
            _log.message(message);
        });
    },

    path : function(rel) {
        var root = this.options.rootDir || "";
        var relout = rel || "";
        return root + rel;
    },

    view : function(res) {
        if(!res)
            return;

        var views = this.options.viewsDir || "";
        var root = this.options.rootDir || "";

        return root + views + "/" + res;
    },

    post : function(path, callback) {
        var newroute = {method:"post", path:path, cb:callback};
        this.options.routes.push(newroute);
        this.route(newroute);
    },

    get : function(path, callback) {
        var newroute = {method:"get", path:path, cb:callback};
        this.route(newroute);
    },

    socket : function(path, callback) {
        var newroute = {method:"socket", path:path, cb:callback};
        this.route(newroute);
    },

    emit : function(event, msg) {
        this.socketio.emit(event, msg);
    }
};