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
brain.post("/u/register", UserRoute.register);
brain.post("/u/unregister", UserRoute.unregister);
brain.get("/u/confirm/:token", UserRoute.confirm);
brain.post("/u/login", UserRoute.login);
brain.post("/u/logout", UserRoute.logout);
brain.post("/u/askresetpassword", UserRoute.askResetPassword);
brain.post("/u/resetpassword", UserRoute.resetPassword);
brain.post("/u/update", UserRoute.update);
//ADMIN ROUTES
brain.post("/u/addpassport", UserRoute.addPassport);
brain.post("/u/removepassport", UserRoute.remPassport);
brain.get("/u/find", UserRoute.find);

brain.usocket("connection", ChatRoute.broadcast);

//QUOTES
var QuoteRoute = require(ROOT_DIR + "/routes/quote");
brain.get("/q/list/:category", QuoteRoute.quotes);
brain.get("/q/get/:quote", QuoteRoute.quote);

//WAP
var WapRoute = require(ROOT_DIR + "/routes/wap");
brain.get("/w/list/:state/:category/:type", WapRoute.list);
brain.get("/w/list/:state/:category", WapRoute.list);
brain.get("/w/list/:state", WapRoute.list);
brain.get("/w/list", WapRoute.list);
brain.get("/w/map/:category/:type?", WapRoute.map);
brain.get("/w/get/:wapid/:state?", WapRoute.get);
brain.post("/w/create", WapRoute.create);
brain.post("/w/startedition", WapRoute.startedition);
brain.post("/w/update", WapRoute.update);
brain.post("/w/endedition", WapRoute.endedition);
brain.post("/w/review", WapRoute.draftreview);
brain.post("/w/repprove", WapRoute.draftrepprove);
brain.post("/w/approve", WapRoute.draftapprove);
brain.post("/w/publish", WapRoute.draftpublish);

//MIDIA
var MidiaRoute = require(ROOT_DIR + "/routes/media");
brain.get("/m/library/:type/:category", MidiaRoute.library);
brain.get("/m/album/:album", MidiaRoute.album);
brain.get("/m/collection/:collection", MidiaRoute.collection);
brain.get("/m/gallery/:gallery", MidiaRoute.gallery);
brain.get("/m/:media\.:ext", MidiaRoute.media);
brain.post("/m/create", MidiaRoute.create);
brain.post("/m/remove", MidiaRoute.remove);
brain.post("/m/update", MidiaRoute.update);

// brain.get("/stories", _marksRoutes.stories);
// brain.get("/stories/:story", _marksRoutes.story);
// brain.post("/stories/:story/:comment", _marksRoutes.createcomment);
// brain.get("/newstory", _marksRoutes.newstory);
// brain.post("/createstory", _marksRoutes.createstory);
// brain.get("/download", _resRoutes.download);