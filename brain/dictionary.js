var _fs = require("fs");

var Log = require("../brain/log");
var JsExt = require("../brain/jsext");
var System = require("../brain/system");
var E = System.error;


module.exports = Dictionary = {};

Dictionary.data = {};

Dictionary.ERROR = System.registerErrors({});

Dictionary.load = function (file) {
    var filecontent = _fs.readFileSync(file, 'utf8');
    var fileobject = JSON.parse(filecontent);
    Dictionary.data = Object.assign(Dictionary.data, fileobject);
}

Dictionary.get = function(key, lang) {
    if(!key)
        return;

    var keyValue = Dictionary.data[key];
    if(!keyValue)
        return key;

    if(typeof(keyValue) == "string")
        return keyValue;

    var keyTrad = lang && keyValue[lang] ? keyValue[lang] : JsExt.first(keyValue);
    return keyTrad;
}