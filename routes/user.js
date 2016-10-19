var System = require(ROOT_DIR + "/brain/system");
var E = System.error;
var Log = require(ROOT_DIR + "/brain/log");
var User = require(ROOT_DIR + "/models/user");

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
            User.saveUserSession(req, newuser);
            response.error = err;
        } else {
            Log.message("user.register success", newuser.email);
            User.saveUserSession(req, savedUser);
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
        User.saveUserSession(req, {email:email});
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
            User.saveUserSession(req, savedUser);
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
            User.saveUserSession(req, {email:email});
        } else {
            Log.message("user.login success to ", user);
            User.saveUserSession(req, user);
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
            User.saveUserSession(req, {email:email});
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
    User.ResetPassword(userid, token, newpassword, function(err, user) {
        if(err) {
            Log.message("user.resetpassword failure to " + userid, err);
            response.error = err;
        } else {
            Log.message("user.resetpassword success to " + userid);
            User.saveUserSession(req, {email:user.email});
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
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
            User.saveUserSession(req, {email:email});
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = req.session.user;
        }
        res.json(response);
    });
}


// ADMIN ROUTES

UserRoute.find = function(req, res) {
    var response = {};
    if(!User.VerifyProfile(req, User.PROFILE.ADMIN)) {
        Log.message("user.find not authorized user", req.session.user);
        response.error = E(User.ERROR.USER_NOTAUTHORIZED, req.session.user);
        res.json(response);
        return;
    }

    var criteria = {};
    var email = req.body.email || req.query.email;
    if(email) criteria.email = email;
    var status = req.body.status || req.query.status;
    if(status) criteria.status = status;
    var label = req.body.label || req.query.label;
    if(label) criteria.label = label;
    var name = req.body.name || req.query.name;
    if(name) criteria.name = name;
    var birthday = req.body.birthday || req.query.birthday;
    if(birthday) criteria.birthday = birthday;
    var since = req.body.since || req.query.since;
    if(since) criteria.since = since;
    var lastlogin = req.body.lastlogin || req.query.lastlogin;
    if(lastlogin) criteria.lastlogin = lastlogin;
    var gender = req.body.gender || req.query.gender;
    if(gender) criteria.gender = gender;
    var profile = req.body.profile || req.query.profile;
    if(profile) criteria.profile = profile;
    var origin = req.body.origin || req.query.origin;
    if(origin) criteria.origin = origin;
    var lang = req.body.lang || req.query.lang;
    if(lang) criteria.lang = lang;

    User.Find(criteria, function(err, users) {
        var response = {};
        if(err) {
            Log.message("user.find failure", err);
            response.error = err;
        } else {
            Log.message("user.find success", users);
            response.success = User.MESSAGE.USER_SUCCESS;
            response.users = users;
        }
        res.json(response);
    });
}

UserRoute.addPassport = function(req, res) {
    var response = {};
    if(!User.VerifyProfile(req, User.PROFILE.ADMIN)) {
        Log.message("user.find not authorized user", req.session.user);
        response.error = E(User.ERROR.USER_NOTAUTHORIZED, req.session.user);
        res.json(response);
        return;
    }

    var email = req.body.email;
    var passport = req.body.passport;

    User.AddPassport(email, passport, function(err, user) {
        if(err || !user) {
            Log.message("user.addpassport failure", err);
            response.error = err;
        } else {
            Log.message("user.addpassport success", user);
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = user;
        }
        res.json(response);
    });
}

UserRoute.remPassport = function(req, res) {
    var response = {};
    if(!User.VerifyProfile(req, User.PROFILE.ADMIN)) {
        Log.message("user.find not authorized user", req.session.user);
        response.error = E(User.ERROR.USER_NOTAUTHORIZED, req.session.user);
        res.json(response);
        return;
    }

    var email = req.body.email;
    var passport = req.body.passport;

    User.RemovePassport(email, passport, function(err, user) {
        if(err || !user) {
            Log.message("user.removepassport failure", err);
            response.error = err;
        } else {
            Log.message("user.removepassport success", user);
            response.success = User.MESSAGE.USER_SUCCESS;
            response.user = user;
        }
        res.json(response);
    });
}