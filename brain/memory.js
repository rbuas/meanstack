module.exports = Memory;

var _mongoose = require('mongoose');
var _log = require("./log");

var _defauloptions = {
    db : "mongodb://localhost/test"
};

function Memory (options) {
    this.options = Object.assign(_defauloptions, options) || {};

    this.connect();
}
Memory.prototype = {
    connect : function() {
        var self = this;
        if(!self.options.db)
            return;

        _mongoose.connect(self.options.db);
        _mongoose.Promise = global.Promise;

        _mongoose.connection.on("connected", function() {
            _log.message("Mongoose connected to " + self.options.db);
        });

        _mongoose.connection.on("error", function(err) {
            _log.error("Mongoose connection error : " + err);
        });

        _mongoose.connection.on("disconnect", function () {
            _log.message("Mongoose disconnected");
        });
    },
    disconnect : function() {
        _mongoose.disconnect();
    }
};