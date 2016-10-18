var _querystring = require("querystring");

module.exports = JsExt = {};

// JS Type Extensions

Function.prototype.extends = function(ParentClass) {
    if(ParentClass.constructor == Function) {
        this.prototype = new ParentClass;
        this.prototype.constructor = this;
        this.prototype.parent = ParentClass.prototype;
    } else {
        this.prototype = ParentClass;
        this.prototype.constructor = this;
        this.prototype.parent = ParentClass;
    }
}

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

RegExp.escape = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


// Extension's functions

JsExt.getObjectValues = function (dataObject) {
    if(!dataObject)
        return;
    var dataArray = Object.keys(dataObject).map(function(k){return dataObject[k]});
    return dataArray;
}

JsExt.serializeDictionary = function (obj, connector) {
    if(!obj)
        return;

    connector = connector || ",";
    var builder = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i) || typeof(i) === 'function') continue;

        builder.push(i + "=" + obj[i]);
    }
    return builder.join(connector);
}

JsExt.buildUrl = function (link, params, starter) {
    var serializedParams = typeof(params) == "string" ? params : _querystring.stringify(params);
    var url = link || "";
    if(serializedParams) {
        starter = starter || "?";
        if(url.indexOf(starter) < 0) {
            url += starter + serializedParams;
        } else {
            url = url.endsWith("&") ? url + serializedParams : url + "&" + serializedParams;
        }
    }

    return url;
}

JsExt.first = function(obj) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i) || typeof(i) === 'function') continue;

        return obj[i];
    }
}