var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");

var _jsext = require("../brain/jsext");
var _log = require("../brain/log");
var Error = require("../brain/error");

global.SALT_WORK_FACTOR = 10;
global.USING_ENCRIPT = true;

var USERSTATUS = module.exports.USERSTATUS = {
    ON : "ON",
    OFF : "OF",
    CONFIRM : "CF",
    BLOCK : "BL",
    ANONYMOUS : "AN"
};
var USERGENDER = module.exports.USERGENDER = {
    M : "M",
    F : "F"
};
var USERPROFILE = module.exports.USERPROFILE = {
    ADMIN : "AD",
    EDITOR : "ED",
    VIEWER : "VW",
    CLIENT : "CL"
};
var USERERROR = module.exports.USERERROR = {
    USER_WRONG_PASSWORD : "USER_WRONG_PASSWORD",
    USER_PARAMS : "USER_PARAMS",
    USER_NOTFOUND : "USER_NOTFOUND",
    USER_CONFIRMATION : "USER_CONFIRMATION",
    USER_BLOCKED : "USER_BLOCKED"
};
var USERERRORMESSAGE = module.exports.USERERRORMESSAGE = {
    USER_WRONG_PASSWORD : "The password not match with registered password",
    USER_PARAMS : "Missing required params",
    USER_NOTFOUND : "Cant find the user",
    USER_CONFIRMATION : "Waiting confirmation",
    USER_BLOCKED : "User blocked"
};

var _usererror = new Error(USERERRORMESSAGE);

/*******
 * @model UserSchema
 */
module.exports.UserSchema = new _mongoose.Schema({
    email : {type:String, unique:true, required:true},
    password : {type:String, required:true},
    label : String,
    name : String,
    birthday : Date,
    since : Date,
    status : {type:String, enum:_jsext.getObjectValues(USERSTATUS)},
    gender : {type:String, enum:_jsext.getObjectValues(USERGENDER)},
    profile : {type:String, enum:_jsext.getObjectValues(USERPROFILE)},
    origin : String,
    lang : String,
    passport : [],
    favorite : [],
    history : []
});

/*******
 * @function ComparePassword
 * @param candidate string Password candidate
 * @param callback function Callback params (error, isMatch)
 */
module.exports.UserSchema.methods.ComparePassword = function(candidate, callback) {
    if(global.USING_ENCRIPT) {
        _bcrypt.compare(candidate, this.password, function(err, isMatch) {
            var error = !isMatch ? _usererror.e(USERERROR.USER_WRONG_PASSWORD, err) : null;
            if(callback) return callback(error, isMatch);
        });
    } else {
        var isMatch = this.password == candidate;
        var error = !isMatch ? _usererror.e(USERERROR.USER_WRONG_PASSWORD) : null;
        if(callback) return callback(error, isMatch);
    }
}

module.exports.UserSchema.pre("save", function(next) {
    var user = this;

    user.since = user.since || new Date();
    user.status = user.status || USERSTATUS.CONFIRM;
    user.label = user.label || user.email && user.email.substr(0, user.email.indexOf("@"));

    if(user.isModified("email")) {
        user.status = USERSTATUS.CONFIRM;
    }

    if(global.USING_ENCRIPT) {
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
                next();
            });
        });
    } else {
        next();
    }
});

module.exports.Module = _mongoose.model("User", module.exports.UserSchema);

var User = _mongoose.model("User");

/*******
 * @function Create
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
module.exports.Create = function(user, callback) {
    if(!user || !user.email || !user.password) {
        if(callback) callback(_usererror.e(USERERROR.USER_PARAMS), false);
        return;
    }

    var newuser = new User();
    newuser.email = user.email;
    newuser.label = user.label;
    newuser.password = user.password;
    newuser.name = user.name;
    newuser.birthday = user.birthday;
    newuser.gender = user.gender;
    newuser.origin = user.origin;
    newuser.profile = user.profile || USERPROFILE.CLIENT; 
    newuser.lang = user.lang; 
    newuser.passport = [];
    newuser.favorite = [];
    newuser.history = [];

    newuser.save(callback);
}

/*******
 * @function CreateAnonymous
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
module.exports.CreateAnonymous = function(user, callback) {
    var newuser = new User();
    newuser.email = newuser.id + "@anonymous.com";
    newuser.password = "a";
    newuser.status =  USERSTATUS.ANONYMOUS;

    newuser.save(callback);
}

/*******
 * @function Update
 * @param user object User with newmail possibility
 * @param callback function Callback params (error, savedUser)
 */
module.exports.Update = function (user, callback) {
    var oldmail = user.email;
    var newemail = user.newemail || user.email;
    User.findOneAndUpdate({email:email}, user, callback);
}

module.exports.Remove = function (where, callback) {
    User.remove(where, callback);
}

module.exports.Login = function (email, password, callback) {
    return User.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(_usererror.e(USERERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.ComparePassword(password, function(err, match) {
            if(err) {
                if(callback) callback(err, user);
                return;
            }

            switch (user.status) {
                case USERSTATUS.CONFIRM:
                    err = _usererror.e(USERERROR.USER_CONFIRMATION);
                    break;
                case USERSTATUS.BLOCK:
                    err = _usererror.e(USERERROR.USER_BLOCKED);
                    break;
                case USERSTATUS.OFF:
                    user.status = USERSTATUS.ON;
                    user.save();
                    break;
                default:
                    break;
            }

            if(callback) callback(err, user);
        });
    });
}

module.exports.Logout = function(email, callback) {
    return User.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(_usererror.e(USERERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.status = USERSTATUS.OFF;
    });
}

module.exports.List = function(username, email, status, callback) {
    var querycond = {};
    if(username) querycond.username = new RegExp(username, "i");
    if(email) querycond.username = new RegExp(email, "i");
    if(status) querycond.status = new RegExp(status, "i");

    return User.find(
        querycond, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, users) {
            if(err || !users) {
                err = _usererror.e(USERERROR.USER_NOTFOUND, err);
            }
            if(callback) callback(err, users);
        }
    );
}

module.exports.PurgeAnonymous = function() {
    var oldusers = [
        {status:USERSTATUS.CONFIRM, since:_moment.subtract(30, "days")},
        {status:USERSTATUS.ANONYMOUS, since:_moment.subtract(30, "days")},
    ];
    for(var purge in oldusers) {
        if(!oldusers.hasOwnProperty(purge)) continue;

        var purgeconfig = oldusers[purge];
        User.remove(purgeconfig);
    }
}