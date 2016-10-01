var _log = require("../brain/log");
var User = require("../models/user");

module.exports.list = function(req, res) {
    var filterEmail = req.params.filtermail;
    var filterName = req.params.filtername;
    var filterStatus = req.params.filterstatus;

    User.Find(filterName, filterEmail, filterStatus, function(err, users) {
        res.json(users);
    });
}

module.exports.register = function(req, res) {
    var newuser = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
        gender : req.body.gender,
        lang : req.body.lang,
        birthday : req.body.birthday
    };

    User.Create(newuser, function(err, savedUser) {
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

    User.Login(email, password, function(err, user) {
        var response = { session:req.session };
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
        res.json(response);
    });
}

module.exports.logout = function(req, res) {
    var response = { session:req.session };
    if(!req.session.useremail || !req.session.userlogged) {
        response.error = "Logout without login";
        _log.message(response.error, req.session.useremail);
    } else {
        response.username = User.Logout(req.session.useremail);
        response.logout = true;

        req.session.destroy();
    }

    res.json(response);
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