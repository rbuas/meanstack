var brain = require("./libs/brain");

var routes = {
    quote : function(req, res) {
        var quoteid = req.params.quote;
        console.log("Route to quote : ", quoteid);
  
        if(!quoteid) {
            res.send("ERROR: can not find quote param");
            return;
        }
        res.send("quoteid : " + quoteid);
    },

    quotes : function(req, res) {
        console.log("Route to quotes");
        var filename = brain.skeleton("quote.html");
        res.sendFile(filename);
    }
};

var brain = new brain.Brain({
    port:8080,
    name: "NodeZero",
    rootDir: __dirname,
    publicDir: "/public",
    routes: [
        {path:"/", cb:routes.quotes},
        {path:"/:quote", cb:routes.quote}
    ]
});