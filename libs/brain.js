var _bodyparser = require("body-parser");
var _express = require("express");
var _session = require("express-session");
var _exphbs  = require('express-handlebars');
var _mongoose = require('mongoose');

var _synapse = require("./synapse");
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
    this.app.use(_bodyparser.urlencoded({extended:true}));
    this.app.use(_session({secret:this.options.encryptkey, resave : true, saveUninitialized : true}));

    this.synapse = new _synapse.Synapse(this);
    this.memory = new _memory.Memory(this);
}
Brain.prototype = {
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
        this.synapse.route(newroute);
    },

    get : function(path, callback) {
        var newroute = {method:"get", path:path, cb:callback};
        this.synapse.route(newroute);
    }
};