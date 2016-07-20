var _log = require("../libs/log");
var _user = require("../models/user");

module.exports.list = function(req, res) {
    var filterEmail = req.params.filtermail;
    var filterName = req.params.filtername;
    var filterStatus = req.params.filterstatus;

    _user.List(filterName, filterEmail, filterStatus, function(err, users) {
        res.json(users);
    });
}

module.exports.register = function(req, res) {
    var newuser = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    };

    _user.Create(newuser, function(err, savedUser) {
        var response = {};
        if(err || !savedUser) {
            var error = "A user already exists with that username or email";
            _log.message(error);
            response.error = error;
        } else {
            response.username = savedUser.username;
            response.userstatus = savedUser.status;
        }
        //update session
        req.session.username = response.username;
        req.session.userlogged = response.username != null;
        response.session = req.session;

        res.json(response);
    });
}

module.exports.confirm = function(req, res) {
    if(req.session.username && req.session.userlogged) {
        res.redirect("/stories");
        return;
    }

    //TODO
}

module.exports.login = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    _log.message("Try to authenticate user ", email);

    req.session.useremail = email;
    req.session.userlogged = false;

    _user.Login(email, password, function(err, user) {
        var response = {};
        if(err || !user) {
            _log.message("Authentication failure to " + email);
            response.loginerror = "Invalid user or password";
        } else {
            _log.message("Authentication sucessfull to " + email);
            req.session.userlogged = true;
            req.session.useremail = user.email;
            req.session.username = user.username;
            req.session.userlang = user.lang;
        }

        response.session = req.session;

        res.json(response);
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
        metatitle:"marks",
        username:username
    };
    res.render("marks_logout", viewdata);
}

module.exports.confirm = function(req, res) {
    //TODO
}

module.exports.restartPassword = function(req, res) {
    //TODO
}

module.exports.addPassport = function(req, res) {
    //TODO
}

module.exports.remPassport = function(req, res) {
    //TODO
}

module.exports.history = function(req, res) {
    //TODO
}