module.exports.Memory = MemoryMySql;

var _mysql= require("mysql");
var _log = require("./log");

function MemoryMySql (options) {
    this.options = Object.assign({}, options) || {};

    this.connectdb();
}
MemoryMySql.prototype = {
    connectdb : function() {
        var self = this;
        if(!self.options.db)
            return;

        this.connection = _mysql.createConnection(this.options.db);
        this.connection.connect();
    },
    query : function(query, callback) {
        return this.connection.query(query, callback);
    }
};