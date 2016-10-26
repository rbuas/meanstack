global.ROOT_DIR = __dirname;

var Brain = require(ROOT_DIR + "/brain/brain");
var brain = global.brain = module.exports.brain = new Brain({
    port:8080,
    name: "NodeTemplateHB",
    rootDir: __dirname,
    viewEngine: "html",
    publicDir: "/static",
    memory: {db: "mongodb://localhost/test"}
});

//var _citiesRoutes = require("./routes/cities");
//var _resRoutes = require("./routes/resource");
var _connectionRoutes = require(ROOT_DIR + "/routes/connection");
var _chat = require(ROOT_DIR + "/routes/chat");

brain.get("/", _connectionRoutes.startpage);
brain.post("/s/connect", _connectionRoutes.connect);
brain.get("/s/reset", _connectionRoutes.reset);

//USER
var UserRoute = require(ROOT_DIR + "/routes/user");
//PUBLIC ROUTES
brain.post("/s/user-register", UserRoute.register);
brain.post("/s/user-unregister", UserRoute.unregister);
brain.get("/s/user-confirm/:token", UserRoute.confirm);
brain.post("/s/user-login", UserRoute.login);
brain.post("/s/user-logout", UserRoute.logout);
brain.post("/s/user-askresetpassword", UserRoute.askResetPassword);
brain.post("/s/user-resetpassword", UserRoute.resetPassword);
brain.post("/s/user-update", UserRoute.update);
//ADMIN ROUTES
brain.post("/s/user-addpassport", UserRoute.addPassport);
brain.post("/s/user-removepassport", UserRoute.remPassport);
brain.get("/s/user-find", UserRoute.find);

brain.usocket("connection", _chat.broadcast);

//QUOTES
var QuoteRoute = require(ROOT_DIR + "/routes/quote");
brain.get("/s/quotes/:category", QuoteRoute.quotes);
brain.get("/s/quote/:quote", QuoteRoute.quote);



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