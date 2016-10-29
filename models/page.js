var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");
var _querystring = require("querystring");
var _crypto = require("crypto");

var JsExt = require(ROOT_DIR + "/brain/jsext");
var Log = require(ROOT_DIR + "/brain/log");
var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Wap = require(ROOT_DIR + "/models/wap");

module.exports = Page = Object.assign({}, Wap);

Page.ERROR = System.registerErrors({
    PAGE_PARAMS : "Missing required params",
    PAGE_NOTFOUND : "Can not find the page",
    PAGE_DUPLICATE : "Duplicate entry",
});
Page.MESSAGE = System.registerMessages({
    PAGE_SUCCESS : "Operation success"
})

/**
 * Page Schema
 */
Page.Schema = new _mongoose.Schema({
}, { strict: true });


Page.DB = _mongoose.model("Page", Page.Schema);


/**
 * Create
 * @param page object
 * @param callback function Callback params (error, savedPage)
 */
Page.Create = function (page, callback) {
    var self = this;
    if(!page || !page.canonical)
        return System.callback(callback, [E(Page.ERROR.PAGE_PARAMS, page), null]);

    var newpage = new self.DB();
    newpage.canonical = page.canonical;
    newpage.author = page.author;
    newpage.title = page.title;
    newpage.metatitle = page.metatitle;
    newpage.metalocale = page.metalocale;
    newpage.metadescription = page.metadescription;
    newpage.metaentity = page.metaentity;
    newpage.metaimage = page.metaimage;
    newpage.metafollow = page.metafollow;
    newpage.metaindex = page.metaindex;
    newpage.priority = page.priority;
    newpage.lastupdate = page.lastupdate || Date.now();;
    newpage.since = page.since || Date.now();
    newpage.category = page.category;
    newpage.crosslink = page.crosslink;
    newpage.alias = page.alias;
    newpage.showcount = 0;

    newpage.save(callback);
}