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

module.exports.getObjectValues = function (dataObject) {
    if(!dataObject)
        return;
    var dataArray = Object.keys(dataObject).map(function(k){return dataObject[k]});
    return dataArray;
}