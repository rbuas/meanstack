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