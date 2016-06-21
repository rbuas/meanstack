var Brain = require("./libs/brain");
var cities = {
    "berlin" : {
        label : "Berlin",
        headline : "Berlin: Where love is in the air",
        images : 4
    },
    "paris" : {
        label : "Paris",
        headline : "Paris: Good talkers are only found in Paris",
        images : 4
    },
    "madrid" : {
        label : "Madrid",
        headline : "Madrid: Buzz, Beautiful architecture and Football",
        images : 4
    },
    "london" : {
        label : "London",
        headline : "London: Sparkling, Still, Food, Gorgeous",
        images : 4
    },
    "newyork" : {
        label : "New York",
        headline : "New York: Come to New York to become someone new",
        images : 6
    }
};

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
    },

    city : function(req, res) {
        var city = req.params.city || "";
        var viewdata = {
            cities:cities,
            city: city,
            metatitle: 'iLoveMyCity',
            title: 'iLoveMyCity',
            headline: 'Can not found this city' + city
        };
        var cityObject = cities[city];
        if(city && cityObject) {
            viewdata.title = viewdata.title + " / " + cityObject.label;
            viewdata.headline = cityObject.headline;
            viewdata.cityimages = [1, 2, 3, 4];
        }
        res.render("city", viewdata);
    },

    cities : function(req, res) {
        var viewdata = {
            cities:cities,
            metatitle: 'iLoveMyCity',
            title: 'iLoveMyCity',
            headline: 'We believe that every city have something to say'
        };
        res.render("cities", viewdata);
    },

    download : function(req, res) {
        res.download("./package.json", function() {
            console.log("download is over!");
        });
    },

    stest : function(req, res) {
        var test = req.params.test || "";
        if(test) {
            if(req.session.test) {
                console.log("test already set : " + req.session.test + " -> " + test);
            }
            req.session.test = test;
        }
        var viewdata = {
            test: req.session.test, 
            city:null, 
            cityimages:0,
            layout:false
        };
        res.render("session", viewdata);
    }
};

var brain = new Brain.Brain({
    port:8080,
    name: "NodeTemplateHB",
    rootDir: __dirname,
    viewEngine: "html",
    publicDir: "/public",
    routes: [
        {path:"/", cb:routes.cities},
        {path:"/city/:city", cb:routes.city},
        {path:"/quotes", cb:routes.quotes},
        {path:"/quotes/:quote", cb:routes.quote},
        {path:"/download", cb:routes.download},
        {path:"/session", cb:routes.stest},
        {path:"/session/:test", cb:routes.stest}
    ]
});