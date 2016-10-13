var System = require("../brain/system");
var Log = require("../brain/log");
var User = require("../models/user");

module.exports = UserRoute = {};

UserRoute.verifyLogged = function(req) {
    var logged = req.session && req.session.user && req.session.user.logged;
    return logged;
}

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
            req.session.user.logged = false;
        } else {
            response.success = User.MESSAGE.USER_SUCCESS;
            req.session.user = {
                label : savedUser.label,
                name : savedUser.name,
                status : savedUser.status,
                email : savedUser.email,
                lang : savedUser.lang,
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
    var token = req.params.token;

    User.Confirm(token, function (err, savedUser) {
        var response = {};

        if(err || !savedUser) {
            Log.message("user.register failure", err);
            response.error = err;
        }

        res.json(response);
    });
}

UserRoute.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    Log.message("Try to authenticate user ", email);
    req.session.user = { mail : email, logged : false };

    User.Login(email, password, function(err, user) {
        var response = { session:req.session };
        if(err || !user) {
            Log.message("Authentication failure to " + email, err);
            response.loginerror = "Invalid user or password";
        } else {
            Log.message("Authentication sucessfull to " + email);
            response.success = User.MESSAGE.USER_SUCCESS;
            req.session.user = {
                label : user.label,
                name : user.name,
                status : user.status,
                email : user.email,
                lang : user.lang,
                logged : user.status == User.STATUS.ON
            };
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