module.exports.Synapse = Synapse;

var _log = require("./log");

function Synapse (brain) {
    console.assert(brain, "ERROR: missing a brain to the synapsys.");
    console.assert(brain.app, "ERROR: missing brain application.");

    this.brain = brain;
    this.options = brain.options;

    this.routing();
    this.listen();
}
Synapse.prototype = {
    routing : function() {
        var routes = this.options.routes;
        _log.assert(routes, "ERROR: missing routes to build synapsys.");

        for(var r in routes) {
            if(!routes.hasOwnProperty(r))
                continue;

            this.route(routes[r]);
        }
    },

    route : function(route) {
        if(!route || !route.path || !route.cb) {
            _log.warning("WARNING: missing parameters in routes table", route);
            return;
        }

        var method = route.method || "get";

        if(route.method == "post") { // POST METHOD
            _log.message("Prepare synapse (post): " + route.path);
            this.brain.app.post(route.path, route.cb);
        } else { // GET METHOD
            _log.message("Prepare synapse (get): " + route.path);
            this.brain.app.get(route.path, route.cb);
        }
    },

    listen : function() {
        var port = this.options.port || 3000;
        var startmessage = "Synapsys active at ";
        var address = this.options.address || "";

        var _this = this;
        return this.brain.app.listen(port, function(request, response) {
            var message = !port ? startmessage + address : startmessage + address + ":" + port;
            _log.message(message);
        });
    }
};