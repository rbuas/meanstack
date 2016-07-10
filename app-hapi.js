var _hapi = require("hapi");
var _memory = require("./libs/memory-mysql");

var server = new _hapi.Server();
server.connection({host:"localhost", port:8080});

var mem = new _memory.Memory({
    db : {
        host     : "hapi-mysql.c9hqcpluczup.us-west-2.rds.amazonaws.com",
        user     : "jason",
        password : "jason",
        port     : "8889",
        database : "edureka"
    }
});

server.route({
    method: "GET",
    path: "/",
    handler: function(req, res) {
        mem.query('SELECT quote,credit from quotes order by rand() limit 1', function(err, rows, fields) {
            if (err) throw err;
            res('"' + rows[0].quote + '" by ' + rows[0].credit);
        });
    }
});
server.route({
    method: "GET",
    path:"/{param*}",
    handler: {
        directory: {
            path: "public"
        }
    }
});

server.start(function() {
    console.log("Catch the action at :"  + server.info.uri);
});