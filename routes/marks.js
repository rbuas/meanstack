var _log = require("../libs/log");
var _user = require("../models/user");
var _story = require("../models/story");

module.exports.marks = function(req, res) {
    if(req.session.username && req.session.userlogged) {
        res.redirect("/stories");
        return;
    }

    var viewdata = {
        layout:"marks",
        session: req.session
    };
    res.render("marks_landing", viewdata);
}

module.exports.about = function(req, res) {
    var viewdata = {
        layout:"marks",
        session: req.session
    };
    res.render("marks_about", viewdata);
}

module.exports.login = function(req, res) {
    if(req.session.username && req.session.userlogged) {
        res.redirect("/stories");
        return;
    }

    var viewdata = {
        layout:"marks",
        session: req.session,
        email:req.session.username
    };
    res.render("marks_login", viewdata);
}

module.exports.authenticate = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    _log.message("Try to authenticate user ", email);

    req.session.username = email;

    _user.Login(email, password, function(err, user) {
        var viewdata = {
            layout:"marks",
            session: req.session
        };
        if(err || !user) {
            req.session.loginerror = "Invalid user or password";
            res.redirect("/login");
            return;
        }

        _log.message("Authentication sucessfull to " + email);
        req.session.loginerror = null;
        req.session.userlogged = true;
        viewdata.session = req.session;
        res.redirect("/stories");
    });
}

module.exports.logout = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }

    var username = _user.Logout(req);
    var viewdata = {
        layout:"marks",
        username:username
    };
    res.render("marks_logout", viewdata);
}

module.exports.register = function(req, res) {
    var username = req.session.user;
    var viewdata = {
        layout:"marks",
        username:username
    };
    res.render("marks_register", viewdata);
}

module.exports.createuser = function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    var viewdata = {
        layout:"marks",
        username:username,
        email:email
    };
    _user.Create(username, email, password, function(err, savedUser) {
        if(err || !savedUser) {
            var message = "A user already exists with that username or email";
            _log.message(message);
            viewdata.registererror = message;
            res.render("marks_register", viewdata);
            return;
        }
        req.session.username = savedUser.username;
        req.session.userlogged = true;
        res.render("marks_newuser", viewdata);
    });
}

module.exports.stories = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }

    var viewdata = {
        layout:"marks",
        session:req.session
    };
    _story.Find({}, function(err, stories){
        viewdata.stories = stories;
        res.render("marks_stories",viewdata);
    });
}

module.exports.story = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }

    var viewdata = {
        layout:"marks",
        session:req.session
    };
    var slug = req.params.story;
    _story.Get({slug:slug}, function(err, story) {
        if(err || !story) {
            _log.error("Error : can not find the story " + slug);
            return res.status(404).send();
        }

        viewdata.story = story;
        res.render("marks_story", viewdata);
    });
}

module.exports.newstory = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }

    var viewdata = {
        layout:"marks",
        session:req.session
    };
    res.render("marks_newstory", viewdata);
}

module.exports.createstory = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }
    var title = req.body.title;
    var imageLink = req.body.imageLink;
    var summary = req.body.summary;
    var content = req.body.content;

    var viewdata = {
        layout:"marks",
        session:req.session
    };

    _story.Create(req.session.username, title, imageLink, summary, content, function(err, savedStory) {
        viewdata.error = err;
        viewdata.storytitle = savedStory.title;
        viewdata.storyslug = savedStory.slug;
        res.render("marks_newstory_confirmation");
    });
}

module.exports.createcomment = function(req, res) {
    if(!req.session.username || !req.session.userlogged) {
        res.redirect("/login");
        return;
    }

   var slug = req.params.story;
   var comment = req.body.comment;
   var author = req.session.username;

    var viewdata = {
        layout:"marks",
        session:req.session
    };

    _story.Get({slug:slug}, function(err, story) {
        if(err || !story) {
            _log.error("Error : can not find the story " + slug);
            return res.status(404).send();
        }

        story.Comment(comment, author, function(err, savedStory) {
            if(err || !savedStory){
                err = "Error : While saving comments (" + (err || "") + ")";
                _log.error(err);
                return res.status(500).send();
            }
            res.redirect("/stories/" + slug);
        });
    });
}