var synapse = require("./libs/synapse");

var server = new synapse.Synapse({
    port:3000,
    rootDir: __dirname,
    publicDir: "/public",
    routes: [
        {path:"/", res:"quote.html"}
    ]
});