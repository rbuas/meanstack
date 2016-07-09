// globals variables must to be exported before all initialization

global.SALT_WORK_FACTOR = 10;
global.USING_ENCRIPT = true;

var _brain = require("./libs/brain");
var brain = global.brain = module.exports.brain = new _brain.Brain({
    port:8080,
    name: "NodeTemplateHB",
    rootDir: __dirname,
    viewEngine: "html",
    publicDir: "/static",
    db: "mongodb://localhost/test"
});

var _quoteRoutes = require("./routes/quotes");
var _citiesRoutes = require("./routes/cities");
var _auxRoutes = require("./routes/aux");
var _marksRoutes = require("./routes/marks");
var _chat = require("./routes/chat");

brain.get("/", _marksRoutes.marks);
brain.get("/about", _marksRoutes.about);
brain.get("/login", _marksRoutes.login);
brain.post("/authenticate", _marksRoutes.authenticate);
brain.get("/logout", _marksRoutes.logout);
brain.get("/register", _marksRoutes.register);
brain.post("/createuser", _marksRoutes.createuser);
brain.get("/stories", _marksRoutes.stories);
brain.get("/stories/:story", _marksRoutes.story);
brain.post("/stories/:story/:comment", _marksRoutes.createcomment);
brain.get("/newstory", _marksRoutes.newstory);
brain.post("/createstory", _marksRoutes.createstory);
brain.get("/cities", _citiesRoutes.cities);
brain.get("/city/:city", _citiesRoutes.city);
brain.get("/quotes", _quoteRoutes.quotes);
brain.get("/quotes/:quote", _quoteRoutes.quote);
brain.get("/download", _auxRoutes.download);
brain.get("/session", _auxRoutes.stest);
brain.get("/session/:test", _auxRoutes.stest);
brain.socket("connection", _chat.broadcast);