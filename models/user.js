var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
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
var ES = new Error(USERERRORMESSAGE);

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
    status : {type:String, enum:JsExt.getObjectValues(USERSTATUS)},
    gender : {type:String, enum:JsExt.getObjectValues(USERGENDER)},
    profile : {type:String, enum:JsExt.getObjectValues(USERPROFILE)},
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
            var error = !isMatch ? ES.e(USERERROR.USER_WRONG_PASSWORD, err) : null;
            if(callback) return callback(error, isMatch);
        });
    } else {
        var isMatch = this.password == candidate;
        var error = !isMatch ? ES.e(USERERROR.USER_WRONG_PASSWORD) : null;
        if(callback) return callback(error, isMatch);
    }
}

module.exports.UserSchema.pre("save", function(next) {
    var user = this;

    // status settings
    if(user.isNew && user.isAnonymous) {
        user.status = USERSTATUS.ANONYMOUS;
    }
    else if(user.isModified("email")) {
        user.status = USERSTATUS.CONFIRM;
    }
    else {
        user.status = user.status || USERSTATUS.CONFIRM;
    }

    user.since = user.since || new Date();
    user.label = user.label || user.email && user.email.substr(0, user.email.indexOf("@"));

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
        if(callback) callback(ES.e(USERERROR.USER_PARAMS), false);
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
module.exports.CreateAnonymous = function(callback) {
    var newuser = new User();
    newuser.email = newuser.id + "@anonymous.com";
    newuser.password = "a";
    newuser.isAnonymous = true;

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

/*******
 * @function Remove
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error)
 */
module.exports.Remove = function (where, callback) {
    User.remove(where, callback);
}

module.exports.Login = function (email, password, callback) {
    return User.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(ES.e(USERERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.ComparePassword(password, function(err, match) {
            if(err) {
                if(callback) callback(err, user);
                return;
            }

            switch (user.status) {
                case USERSTATUS.CONFIRM:
                    err = ES.e(USERERROR.USER_CONFIRMATION);
                    break;
                case USERSTATUS.BLOCK:
                    err = ES.e(USERERROR.USER_BLOCKED);
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
            if(callback) callback(ES.e(USERERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.status = USERSTATUS.OFF;
    });
}

/*******
 * @function Find
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error, users)
 */
module.exports.Find = function(where, callback) {
    var querycond = where || {};
    if(where) {
        if(where.email) querycond.email = new RegExp(where.email, "i");
        if(where.status) querycond.status = new RegExp(where.status, "i");
        if(where.id) querycond.id = where.id;
    }

    return User.find(
        querycond, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, users) {
            if(err || !users) {
                err = ES.e(USERERROR.USER_NOTFOUND, err);
            }
            if(callback) callback(err, users);
        }
    );
}

module.exports.PurgeAnonymous = function(days, callback) {
    var where = {status:USERSTATUS.ANONYMOUS};
    if(days) where.since = _moment.subtract(days, "days");

    User.remove(where, callback);
}

module.exports.PurgeNonConfirmed = function(days, callback) {
    var where = {status:USERSTATUS.CONFIRM};
    if(days) where.since = _moment.subtract(days, "days");

    User.remove(where, callback);
}