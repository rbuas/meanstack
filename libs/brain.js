module.exports.Brain = Brain;

var Synapse = require("./synapse").Synapse;

var _bodyparser = require("body-parser");
var _express = require("express");
var _handlebars = require("handlebars");

var _defaultoptions = {
    port : 3000,
    name : "",
    address : "localhost",
    startmessage:"Synapsys active at ",
    publicmessage: "Public files at ",
    rootDir: "",
    publicDir: "/public",
    viewsDir : "/skeletons",
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

    this.app.set("view engine", "handlebars");

    var publicpath = this.path(this.options.publicDir); 
    this.app.use(_express.static(publicpath));
    console.log(this.options.publicmessage, publicpath);

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