var System = require("../brain/system");
var Log = require("../brain/log");
var User = require("../models/user");

module.exports = UserRoute = {};

UserRoute.register = function(req, res) {
    var newuser = {
        email : req.body.email,
        password : req.body.password,
        label : req.body.label,
        name : req.body.name,
        gender : req.body.gender,
        lang : req.body.lang,
        birthday : req.body.birthday,
        origin : req.body.origin,
        profile : req.body.profile
    };

    User.Create(newuser, function(err, savedUser) {
        var response = {};

        if(err || !savedUser) {
            Log.message("user.register failure", err);
            response.error = err;
            req.session.user = newuser;
            delete(req.session.user.password);
        } else {
            response.success = User.MESSAGE.USER_SUCCESS;
            req.session.user = {
                label : savedUser.label,
                name : savedUser.name,
                status : savedUser.status,
                email : savedUser.email,
                logged : savedUser.status == User.STATUS.ON
            };
        }

        response.session = req.session;

        res.json(response);
    });
}

UserRoute.unregister = function (req, res) {
    User.SoftRemove(req.body.email, req.body.password, function(err, savedUser) {
        var response = {};

        if(err || !savedUser) {
            Log.message("user.unregister failure", err);
            response.error = err;
        } else {
            response.success = User.MESSAGE.USER_SUCCESS;
        }
        req.session.user = {
            email : req.body.email
        };

        response.session = req.session;

        res.json(response);
    });
}

UserRoute.confirm = function (req, res) {
    if(req.session.username && req.session.userlogged) {
        res.redirect("/stories");
        return;
    }

    //TODO
}

UserRoute.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    Log.message("Try to authenticate user ", email);

    req.session.useremail = email;
    req.session.userlogged = false;

    User.Login(email, password, function(err, user) {
        var response = { session:req.session };
        if(err || !user) {
            Log.message("Authentication failure to " + email);
            response.loginerror = "Invalid user or password";
        } else {
            Log.message("Authentication sucessfull to " + email);
            req.session.userlogged = true;
            req.session.useremail = user.email;
            req.session.username = user.username;
            req.session.userlang = user.lang;
        }
        res.json(response);
    });
}

UserRoute.logout = function(req, res) {
    var response = { session:req.session };
    if(!req.session.useremail || !req.session.userlogged) {
        response.error = "Logout without login";
        Log.message(response.error, req.session.useremail);
    } else {
        response.username = User.Logout(req.session.useremail);
        response.logout = true;

        req.session.destroy();
    }

    res.json(response);
}

UserRoute.restartPassword = function(req, res) {
    //TODO
}

UserRoute.addPassport = function(req, res) {
    //TODO
}

UserRoute.remPassport = function(req, res) {
    //TODO
}

UserRoute.history = function(req, res) {
    //TODO
}

UserRoute.list = function(req, res) {
    var criteria = {
        status : req.body.status,
        label : req.body.label,
        name : req.body.name,
        birthday : req.body.birthday,
        since : req.body.since,
        lastlogin : req.body.lastlogin,
        gender : req.body.gender,
        profile : req.body.profile,
        origin : req.body.origin,
        lang : req.body.lang,
    };

    User.Find(filterName, filterEmail, filterStatus, function(err, users) {
        res.json(users);
    });
}