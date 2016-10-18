// globals variables must to be exported before all initialization

var Brain = require(__dirname + "/brain/brain");
var brain = global.brain = module.exports.brain = new Brain({
    port:8080,
    name: "NodeTemplateHB",
    rootDir: __dirname,
    viewEngine: "html",
    publicDir: "/static",
    memory: {db: "mongodb://localhost/test"}
});

var _quoteRoutes = require("./routes/quotes");
//var _citiesRoutes = require("./routes/cities");
//var _resRoutes = require("./routes/resource");
var _connectionRoutes = require("./routes/connection");
var UserRoute = require("./routes/user");
var _chat = require("./routes/chat");

brain.get("/", _connectionRoutes.startpage);

brain.post("/s/user-register", UserRoute.register);
brain.post("/s/user-unregister", UserRoute.unregister);
brain.get("/s/user-confirm/:token", UserRoute.confirm);
brain.post("/s/user-login", UserRoute.login);
brain.post("/s/user-logout", UserRoute.logout);
brain.post("/s/user-askresetpassword", UserRoute.askResetPassword);
brain.post("/s/user-resetpassword", UserRoute.resetPassword);
brain.get("/s/user-find", UserRoute.find);

brain.post("/s/connect", _connectionRoutes.connect);
brain.get("/s/reset", _connectionRoutes.reset);
brain.get("/s/user-addpassport", UserRoute.addPassport);
brain.get("/s/user-rempassport", UserRoute.remPassport);

brain.get("/s/quotes", _quoteRoutes.quotes);
brain.get("/s/quotes/:quote", _quoteRoutes.quote);

brain.usocket("connection", _chat.broadcast);

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
// brain.get("/download", _resRoutes.download);
// brain.get("/session", _resRoutes.stest);
// brain.get("/session/:test", _resRoutes.stest);