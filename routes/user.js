var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Log = require(ROOT_DIR + "/brain/log");
var User = require(ROOT_DIR + "/models/user");

module.exports = UserRoute = {};

UserRoute.verifyLogged = function(req) {
    var logged = req.session && req.session.user && req.session.user.logged;
    return logged;
}

UserRoute.saveUserSession = function(req, user) {
    if(!req || !user)
        return;

    req.session.user = {
        label : user.label,
        name : user.name,
        status : user.status,
        email : user.email,
        lang : user.lang,
        logged : user.status == User.STATUS.ON
    };
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
            UserRoute.saveUserSession(req, newuser);
            response.error = err;
        } else {
            Log.message("user.register success", newuser.email);
            UserRoute.saveUserSession(req, savedUser);
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
    });
}

UserRoute.unregister = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    User.SoftRemove(email, password, function(err, savedUser) {
        var response = {};
        if(err || !savedUser) {
            Log.message("user.unregister failure", err);
            response.error = err;
        } else {
            Log.message("user.unregister success", email);
            response.success = User.MESSAGE.USER_SUCCESS;
        }
        UserRoute.saveUserSession(req, {email:email});
        response.user = req.session.user;
        res.json(response);
    });
}

UserRoute.confirm = function (req, res) {
    var token = req.params.token;

    User.Confirm(token, function (err, savedUser) {
        var response = {};

        if(err || !savedUser) {
            Log.message("user.confirm failure", err);
            response.error = err;
        } else {
            Log.message("user.confirm success", token);
            UserRoute.saveUserSession(req, savedUser);
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
    });
}

UserRoute.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    User.Login(email, password, function(err, user) {
        var response = {};
        if(err || !user) {
            Log.message("user.login failure to " + email, err);
            response.error = err;
            UserRoute.saveUserSession(req, {email:email});
        } else {
            Log.message("user.login success to " + email);
            UserRoute.saveUserSession(req, user);
            response.success = User.MESSAGE.USER_SUCCESS;
        }
        response.user = req.session.user;
        res.json(response);
    });
}

UserRoute.logout = function(req, res) {
    var email = req.session.user && req.session.user.email;
    var logged = req.session.user && req.session.user.logged;
    var response = {};
    if(!email || !logged) {
        Log.message("user.logout without logged user", req.session.user);
        response.error = E(User.ERROR.USER_NOTLOGGED, req.session.user);
        res.json(response);
        return;
    }

    User.Logout(email, function(err, user) {
        if(err || !user) {
            Log.message("user.logout failure to " + email, err);
            response.error = err;
        } else {
            Log.message("user.logout success to " + email, err);
            UserRoute.saveUserSession(req, {email:email});
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
    });
}

UserRoute.resetPassword = function(req, res) {
    var userid = req.body.userid;
    var token = req.body.token;
    var newpassword = req.body.newpassword;
    var response = {};
    User.ResetPassword(userid, token, newpassword, function(err) {
        if(err) {
            Log.message("user.resetpassword failure to " + email, err);
            response.error = err;
        } else {
            Log.message("user.resetpassword success to " + email);
            UserRoute.saveUserSession(req, {email:email});
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
    });
}

UserRoute.askResetPassword = function(req, res) {
    var email = req.body.email;
    var response = {};
    User.AskResetPassword(email, function(err) {
        if(err) {
            Log.message("user.askresetpassword failure to " + email, err);
            response.error = err;
        } else {
            Log.message("user.askresetpassword success to " + email);
            UserRoute.saveUserSession(req, {email:email});
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
    });
}


// ADMIN ROUTES

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



UserRoute.addPassport = function(req, res) {
    //TODO
}

UserRoute.remPassport = function(req, res) {
    //TODO
}

UserRoute.history = function(req, res) {
    //TODO
}