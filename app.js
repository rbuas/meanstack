var synapse = require("./libs/synapse");

var server = new synapse.Synapse({
    port:8080,
    rootDir: __dirname,
    publicDir: "/public",
    routes: [
        {path:"/", res:"quote.html"}
    ]
});