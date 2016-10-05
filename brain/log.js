var _chalk = require("chalk");
var _util = require("util");

module.exports = Log;
function Log () {}

Log.error = function(message, obj) {
    var line = _chalk.bold.red("ERROR : ") + _chalk.red(message);
    Log.message(line, obj);
}

Log.warning = function(message, obj) {
    var line = _chalk.bold.yellow("ERROR : ") + _chalk.yellow(message);
    Log.message(line, obj);
}

Log.success = function(message, obj) {
    var line = _chalk.bold.green("OK : ") + _chalk.green(message);
    Log.message(line, obj);
}

Log.assert = function(condition, message, obj) {
    if(condition)
        return;
    return Log.error(message, obj);
}

Log.message = function(message, obj) {
    var line = message; 
    if(obj)
        console.log(line, dump(obj));
    else
        console.log(line);
}

Log.section = function (message) {
    var line = _chalk.bgBlack.white("SECTION - " + message);
    Log.message(line);
}

function dump (obj) {
    return _util.inspect(obj, {depth:null});
}