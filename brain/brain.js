module.exports = Brain;

var _bodyparser = require("body-parser");
var _express = require("express");
var _session = require("express-session");
var _exphbs  = require("express-handlebars");
var _mongoose = require("mongoose");
var _http = require("http");
var _socket = require("socket.io");

var Memory = require("./memory");
var Log = require("./log");
var UserManager = require("./usermanager");

var _defaultoptions = {
    port : 3000,
    name : "",
    address : "localhost",
    rootDir: "",
    publicDir: "/public",
    viewsDir: "/views",
    encryptkey: "secret",
    viewEngine: null,
    memory: {db : null},
    routes : null
};

function Brain (options) {
    var self = this;
    self.options = Object.assign(_defaultoptions, options) || {};
    self.options.routes = self.options.routes || [];

    self.app = _express();
    Log.assert(self.app, "ERROR: can not create app from express");

    self.server = _http.createServer(self.app);
    Log.assert(self.server, "ERROR: can not create server from http");

    self.usermanager = new UserManager(self.server);
    Log.assert(self.usermanager, "ERROR: can not start UserManager module");

    Log.message("Brain " + (self.options.name || "") + " started");

    if(self.options.viewEngine) {
        var viewDir = self.path(self.options.viewsDir);
        self.app.set("views", viewDir);
        Log.message("Brain : set view path : ", viewDir);
        self.app.engine(self.options.viewEngine, _exphbs({
            defaultLayout: "master", 
            extname: ".html", 
            partialsDir: viewDir + "/partials/",
            layoutDir: viewDir + "/layouts/"
        }));
        self.app.set("view engine", self.options.viewEngine);
    }

    var publicpath = self.path(self.options.publicDir); 
    self.app.use(_express.static(publicpath));
    Log.message("Static files at ", publicpath);

    self.app.use(_bodyparser.json());
    self.app.use(_bodyparser.json({ type: 'application/vnd.api+json' })); 
    self.app.use(_bodyparser.urlencoded({extended:true}));
    self.app.use(_session({secret:self.options.encryptkey, resave : true, saveUninitialized : true}));

    self.memory = new Memory(self.options.memory);

    self.synapsys();
    self.listen();
}

Brain.prototype.synapsys = function() {
    var self = this;
    var routes = self.options.routes;
    Log.assert(routes, "ERROR: missing routes to build synapsys.");

    for(var r in routes) {
        if(!routes.hasOwnProperty(r))
            continue;

        self.route(routes[r]);
    }
}

Brain.prototype.route = function(route) {
    var self = this;
    if(!route || !route.path || !route.cb) {
        Log.warning("WARNING: missing parameters in routes table", route);
        return;
    }

    var method = route.method || "get";
    switch(method) {
        case "post": // POST METHOD
            Log.message("Prepare synapse (post): " + route.path);
            self.app.post(route.path, route.cb);
        break;

        case "get": // GET METHOD
            Log.message("Prepare synapse (get): " + route.path);
            self.app.get(route.path, route.cb);
        break;

        case "usocket":
            Log.message("Prepare synapse (user socket): " + route.path);
            self.usermanager.on(route.path, route.cb);
        break;
    }
}

Brain.prototype.listen = function() {
    var self = this;
    var port = self.options.port || 3000;
    var address = self.options.address || "";

    return self.server.listen(port, function(request, response) {
        var message = "App active at " + address;
        if(port) message = message + ":" + port;
        Log.message(message);
    });
}

Brain.prototype.path = function(rel) {
    var self = this;
    var root = self.options.rootDir || "";
    var relout = rel || "";
    return root + rel;
}

Brain.prototype.view = function(res) {
    var self = this;
    if(!res)
        return;

    var views = self.options.viewsDir || "";
    var root = self.options.rootDir || "";

    return root + views + "/" + res;
}

Brain.prototype.post = function(path, callback) {
    var self = this;
    var newroute = {method:"post", path:path, cb:callback};
    self.options.routes.push(newroute);
    self.route(newroute);
}

Brain.prototype.get = function(path, callback) {
    var self = this;
    var newroute = {method:"get", path:path, cb:callback};
    self.route(newroute);
}

Brain.prototype.usocket = function(path, callback) {
    var self = this;
    var newroute = {method:"usocket", path:path, cb:callback};
    self.route(newroute);
}

Brain.prototype.draw = function(filepath, data, callback) {
    return self.engine.render(filepath, data).then(function(result) {
        if(callback) callback(result);
        return result;
    });
}