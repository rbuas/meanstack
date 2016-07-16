var _chalk = require("chalk");
var _util = require("util");

module.exports.error = function(message, obj) {
    var line = _chalk.bold.red("ERROR : ") + _chalk.red(message);
    module.exports.message(line, dump(obj));
}

module.exports.warning = function(message, obj) {
    var line = _chalk.bold.yellow("ERROR : ") + _chalk.yellow(message);
    module.exports.message(line, dump(obj));
}

module.exports.assert = function(condition, message, obj) {
    if(condition)
        return;
    return module.exports.error(message, dump(obj));
}

module.exports.message = function(message, obj) {
    var line = message; 
    if(obj)
        console.log(line, dump(obj));
    else
        console.log(line);
}

module.exports.section = function (message) {
    var line = _chalk.bgBlack.white("SECTION - " + message);
    module.exports.message(line);
}

function dump (obj) {
    return _util.inspect(obj, {depth:null});
}