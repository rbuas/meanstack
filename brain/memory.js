module.exports = Memory;

var _mongoose = require('mongoose');
var Log = require("./log");

var _defauloptions = {
    db : "mongodb://localhost/test"
    //onconnect : function to call on connection response
};

function Memory (options) {
    this.options = Object.assign(_defauloptions, options) || {};

    this.connect(this.options.onconnect);
}
Memory.prototype = {
    connect : function(callback) {
        var self = this;
        if(!self.options.db)
            return;

        _mongoose.connect(self.options.db);
        _mongoose.Promise = global.Promise;

        _mongoose.connection.on("connected", function() {
            Log.message("Mongoose connected to " + self.options.db);
            if(callback) callback();
        });

        _mongoose.connection.on("error", function(err) {
            Log.error("Mongoose connection error : " + err);
            if(callback) callback();
        });

        _mongoose.connection.on("disconnect", function () {
            Log.message("Mongoose disconnected");
        });
    },
    disconnect : function(callback) {
        _mongoose.disconnect(callback);
    }
};