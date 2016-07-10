module.exports.Memory = Memory;

var _mongoose = require('mongoose');
var _log = require("./log");

function Memory (options) {
    this.options = Object.assign({}, options) || {};

    this.connectdb();
}
Memory.prototype = {
    connectdb : function() {
        var self = this;
        if(!self.options.db)
            return;

        _mongoose.connect(this.options.db);

        _mongoose.connection.on("connected", function() {
            _log.message("Mongoose connected to " + self.options.db);
        });

        _mongoose.connection.on("error", function(err) {
            _log.error("Mongoose connection error : " + err);
        });

        _mongoose.connection.on("disconnect", function () {
            _log.message("Mongoose disconnected");
        });
    }
};