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
var PageRoute = require(ROOT_DIR + "/routes/page");
var ChatRoute = require(ROOT_DIR + "/routes/chat");

brain.get("/", PageRoute.startpage);
brain.post("/s/connect", PageRoute.connect);
brain.get("/s/reset", PageRoute.reset);

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

brain.usocket("connection", ChatRoute.broadcast);

//QUOTES
var QuoteRoute = require(ROOT_DIR + "/routes/quote");
brain.get("/s/quotes/:category", QuoteRoute.quotes);
brain.get("/s/quote/:quote", QuoteRoute.quote);

//WAP
var WapRoute = require(ROOT_DIR + "/routes/wap");
brain.get("/s/waps/:state/:category/:type", WapRoute.list);
brain.get("/s/waps/:state/:category", WapRoute.list);
brain.get("/s/waps/:state", WapRoute.list);
brain.get("/s/waps", WapRoute.list);
brain.get("/s/wapmap/:category/:type?", WapRoute.map);
brain.get("/s/wap/:wapid/:state?", WapRoute.get);
brain.post("/s/wap-create", WapRoute.create);
brain.post("/s/wap-update", WapRoute.update);
brain.post("/s/wap-draftstart", WapRoute.draftstart);
brain.post("/s/wap-draftedit", WapRoute.draftedit);
brain.post("/s/wap-draftclose", WapRoute.draftclose);
brain.post("/s/wap-draftreview", WapRoute.draftreview);
brain.post("/s/wap-draftrepprove", WapRoute.draftrepprove);
brain.post("/s/wap-draftapprove", WapRoute.draftapprove);
brain.post("/s/wap-draftpublish", WapRoute.draftpublish);


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