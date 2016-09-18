// globals variables must to be exported before all initialization

global.SALT_WORK_FACTOR = 10;
global.USING_ENCRIPT = true;

var _brain = require("./brain/brain");
var brain = global.brain = module.exports.brain = new _brain.Brain({
    port:8080,
    name: "NodeTemplateHB",
    rootDir: __dirname,
    viewEngine: "html",
    publicDir: "/static",
    db: "mongodb://localhost/test"
});

var _quoteRoutes = require("./routes/quotes");
//var _citiesRoutes = require("./routes/cities");
//var _auxRoutes = require("./routes/aux");
var _basicRoutes = require("./routes/basic");
var _userRoutes = require("./routes/user");
var _chat = require("./routes/chat");

brain.get("/", _basicRoutes.startpage);

brain.post("/s/connect", _basicRoutes.connect);
brain.get("/s/user", _userRoutes.list);
brain.get("/s/user/:filtername", _userRoutes.list);
brain.post("/s/user-register", _userRoutes.register);
brain.post("/s/user-confirm", _userRoutes.confirm);
brain.get("/s/user-restartpass", _userRoutes.restartPassword);
brain.post("/s/user-login", _userRoutes.login);
brain.get("/s/user-addpassport", _userRoutes.addPassport);
brain.get("/s/user-rempassport", _userRoutes.remPassport);
brain.get("/s/user-history", _userRoutes.history);
brain.post("/s/user-logout", _userRoutes.logout);

brain.get("/s/quotes", _quoteRoutes.quotes);
brain.get("/s/quotes/:quote", _quoteRoutes.quote);

brain.socket("connection", _chat.broadcast);

// brain.get("/login", _marksRoutes.login);
// brain.get("/register", _marksRoutes.register);
// brain.get("/marks", _marksRoutes.marks);
// brain.get("/about", _marksRoutes.about);
// brain.get("/stories", _marksRoutes.stories);
// brain.get("/stories/:story", _marksRoutes.story);
// brain.post("/stories/:story/:comment", _marksRoutes.createcomment);
// brain.get("/newstory", _marksRoutes.newstory);
// brain.post("/createstory", _marksRoutes.createstory);
// brain.get("/cities", _citiesRoutes.cities);
// brain.get("/city/:city", _citiesRoutes.city);
// brain.get("/download", _auxRoutes.download);
// brain.get("/session", _auxRoutes.stest);
// brain.get("/session/:test", _auxRoutes.stest);