module.exports.Log = Log;

var _chalk = require("chalk");

var Log = {
    error : function(message, obj) {
        var line = _chalk.bold.red("ERROR : ") + _chalk.red(message);
        console.log(line, obj);
    },

    warning : function(message, obj) {
        var line = _chalk.bold.yellow("ERROR : ") + _chalk.yellow(message);
        console.log(line, obj);
    },

    message : function(message, obj) {
        var line = message;
        console.log(line, obj);
    },

    section : function (message) {
        var line = _chalk.bgBlack.white("SECTION - " + message);
        console.log(line);
    } 
}