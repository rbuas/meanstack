module.exports.Brain = Brain;

var Synapse = require("./synapse").Synapse;

var _bodyparser = require("body-parser");
var _express = require("express");
var _session = require("express-session");
var _exphbs  = require('express-handlebars');
//var _ejs = require('ejs');

var _defaultoptions = {
    port : 3000,
    name : "",
    address : "localhost",
    startmessage:"Synapsys active at ",
    publicmessage: "Public files at ",
    rootDir: "",
    publicDir: "/public",
    viewsDir: "/skeletons",
    viewEngine: null,
    routes : [
        {path:"/", res:"index.html", method:"get"}
    ]
};
console.assert(_express, "ERROR: can not import express module")


function Brain (options) {
    this.options = Object.assign(_defaultoptions, options) || {};

    this.app = _express();
    console.assert(this.app, "ERROR: can not create app from express");

    console.log("Brain " + (this.options.name || "") + " started");

    if(this.options.viewEngine) {
        var skeletonDir = this.path(this.options.viewsDir);
        this.app.set("views", skeletonDir);
        console.log("Brain : set skeleton path : ", skeletonDir);
        this.app.engine(this.options.viewEngine, _exphbs({
            defaultLayout: "main", 
            extname: ".html", 
            partialsDir: this.options.viewsDir + "/partials",
            layoutDir: this.options.viewsDir + "/layouts"
        }));
        this.app.set("view engine", this.options.viewEngine);
    }

    var publicpath = this.path(this.options.publicDir); 
    this.app.use(_express.static(publicpath));
    console.log(this.options.publicmessage, publicpath);

    this.app.use(_session({secret:"secret", resave : true, saveUnitialized : false}));
    this.app.use(_bodyparser.json());
    this.app.use(_bodyparser.urlencoded({ extended: false }));

    this.synapse = new Synapse(this);
}
Brain.prototype = {
    path : function(rel) {
        var root = this.options.rootDir || "";
        var relout = rel || "";
        return root + rel;
    },

    skeleton : function(res) {
        if(!res)
            return;

        var views = this.options.viewsDir || "";
        var root = this.options.rootDir || "";

        return root + views + "/" + res;
    }
};