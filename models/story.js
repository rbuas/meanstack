var _mongoose = require("mongoose");
var _log = require("../brain/log");

module.exports.Shema = new _mongoose.Schema({
    author:String,
    title: {type: String,unique:true},
    created_at:{type:Date,default:Date.now},
    summary:String,
    content: {type: String},
    imageLink:String,
    comments:[{comment:String,author:String,date:Date}],
    slug:String
});

module.exports.Shema.methods.Comment = function(comment, author, callback) {
    var newcomment = {
        comment : comment,
        author : author,
        date : new Date()
    };

    this.comments.push(newcomment);
    return this.save(callback);
}

module.exports.Module = _mongoose.model("Story", module.exports.Shema);

var Story = _mongoose.model("Story");

module.exports.Find = function(filter, callback) {
    return Story.find(filter, callback);
}

module.exports.Get = function(filter, callback) {
    return Story.findOne(filter, callback);
}

function buildSlug (title) {
    if(!title)
        return;

    var lowercaseTitle = title.toLowerCase();
    var slug = lowercaseTitle.replace(/[^a-zA-Z0-9 ]/g, "");
    var hyphenSlug = slug.replace(/\s+/g, '-');
    return hyphenSlug;
}

module.exports.Create = function(author, title, imageLink, summary, content, callback) {
    var newStory = new Story();
    newStory.author = author;
    newStory.title = title;
    newStory.imageLink = imageLink;
    newStory.summary = summary;
    newStory.content = content;
    newStory.comments = [];
    newStory.slug = buildSlug(title);

    newStory.save(function(err, savedStory) {
       if(err || !savedStory) {
         err = "Error while saving the story (" + (err || "") + ")";
         _log.error(err, newStory);
       }
       if(callback) callback(err, savedStory);
   });
}