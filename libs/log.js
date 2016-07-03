var _chalk = require("chalk");

module.exports.error = function(message, obj) {
    var line = _chalk.bold.red("ERROR : ") + _chalk.red(message);
    module.exports.message(line, obj);
}

module.exports.warning = function(message, obj) {
    var line = _chalk.bold.yellow("ERROR : ") + _chalk.yellow(message);
    module.exports.message(line, obj);
}

module.exports.assert = function(condition, message, obj) {
    if(condition)
        return;
    return module.exports.error(message, obj);
}

module.exports.message = function(message, obj) {
    var line = message;
    if(obj)
        console.log(line, obj);
    else
        console.log(line);
}

module.exports.section = function (message) {
    var line = _chalk.bgBlack.white("SECTION - " + message);
    module.exports.message(line);
}