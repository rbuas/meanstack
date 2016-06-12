module.exports.Synapse = Synapse;

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
        console.assert(routes, "ERROR: missing routes to build synapsys.");

        for(var r in routes) {
            if(!routes.hasOwnProperty(r))
                continue;

            var route = routes[r];
            if(!route || !route.path || !route.cb) {
                console.warn("WARNING: missing parameters in routes table", route);
                continue;
            }

            var method = route.method || "get";
            console.log("Prepare synapse : " + route.path);

            if(route.method == "post") { // POST METHOD
                //TODO
            } else { // GET METHOD
                var _this = this;
                this.brain.app.get(route.path, route.cb);
            }
        }
    },

    listen : function() {
        var port = this.options.port || 3000;
        var startmessage = this.options.startmessage || "";
        var address = this.options.address || "";

        var _this = this;
        return this.brain.app.listen(port, function(request, response) {
            var message = !port ? startmessage + address : startmessage + address + ":" + port;
            console.log(message);
        });
    }
};