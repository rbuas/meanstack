var _mongoose = require("mongoose");
var _log = require("../libs/log");
var _bcrypt = require('bcrypt');

module.exports.Shema = new _mongoose.Schema({
    username : {type:String, unique:true},
    email : {type:String, unique:true},
    password : String
});

module.exports.Shema.methods.ComparePassword = function(candidate, callback) {
    if(global.USING_ENCRIPT) {
        _bcrypt.compare(candidate, this.password, function(err, isMatch) {
            var error = !isMatch ? "Wrong password (" + (err || "") + ")": null;
            if(callback) return callback(error, isMatch);
        });
    } else {
        var isMatch = this.password == candidate;
        var error = !isMatch ? "Wrong password" : null;
        if(callback) return callback(error, isMatch);
    }
    
}

if(global.USING_ENCRIPT) {
    module.exports.Shema.pre("save", function(next) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified("password")) return next();

        // generate a salt
        _bcrypt.genSalt(global.SALT_WORK_FACTOR || 10, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            _bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                _log.message("User password hased : " + hash);
                next();
            });
        });
    });
}

module.exports.Module = _mongoose.model("User", module.exports.Shema);

var User = _mongoose.model("User");

module.exports.Create = function(username, email, password, callback) {
    var newuser = new User();
    newuser.username = username;
    newuser.email = email;
    newuser.password = password;

    newuser.save(callback);
}

module.exports.Login = function(email, password, callback) {
    return User.findOne({email:email}, function(err, user) {
        if(err || !user) {
            err = "Cant find the user (" + err + ")";
            if(callback) callback(err, user);
            return;
        }
        user.ComparePassword(password, function(err, match) {
            if(callback) callback(err, user);
        });
    });
}

module.exports.Logout = function(req) {
    var username = req.session.username;

    _log.message("Loggin out : ", username, "...");
    req.session.destroy();

    return username;
}