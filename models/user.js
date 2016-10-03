var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var Error = require("../brain/error");

var SALT_WORK_FACTOR = 10;
var USING_ENCRIPT = true;

module.exports = User;
function User () {}

User.STATUS = {
    ON : "ON",
    OFF : "OF",
    CONFIRM : "CF",
    BLOCK : "BL",
    ANONYMOUS : "AN"
};
User.GENDER = {
    M : "M",
    F : "F"
};
User.PROFILE = {
    ADMIN : "AD",   //backoffice administrator
    EDITOR : "ED",  //middleoffice editor manager
    WRITER : "WR",  //middleoffice writer
    GUEST : "GS",   //middleoffice guest
    CLIENT : "CL"   //frontoffice client
};
User.ERROR = {
    USER_WRONG_PASSWORD : "USER_WRONG_PASSWORD",
    USER_PARAMS : "USER_PARAMS",
    USER_NOTFOUND : "USER_NOTFOUND",
    USER_UNKNOW : "USER_UNKNOW",
    USER_CONFIRMATION : "USER_CONFIRMATION",
    USER_BLOCKED : "USER_BLOCKED"
};
User.ERRORMESSAGE = {
    USER_WRONG_PASSWORD : "The password not match with registered password",
    USER_PARAMS : "Missing required params",
    USER_NOTFOUND : "Cant find the user",
    USER_UNKNOW : "Unknow user",
    USER_CONFIRMATION : "Waiting confirmation",
    USER_BLOCKED : "User blocked"
};

var ES = new Error(User.ERRORMESSAGE);


/**
 * User Schema
 */
User.Schema = new _mongoose.Schema({
    email : {type:String, unique:true, required:true},
    password : {type:String, required:true},
    label : String,
    name : String,
    birthday : Date,
    since : {type:Date, default:Date.now},
    lastlogin : Date,
    status : {type:String, enum:JsExt.getObjectValues(User.STATUS), default: User.STATUS.ANONYMOUS},
    gender : {type:String, enum:JsExt.getObjectValues(User.GENDER)},
    profile : {type:String, enum:JsExt.getObjectValues(User.PROFILE), default: User.PROFILE.CLIENT},
    origin : String,
    lang : String,
    passport : [],
    favorite : [],
    history : []
}, { strict: true });

/*******
 * @function ComparePassword
 * @param candidate string Password candidate
 * @param callback function Callback params (error, isMatch)
 */
User.Schema.methods.ComparePassword = function(candidate, callback) {
    if(USING_ENCRIPT) {
        _bcrypt.compare(candidate, this.password, function(err, isMatch) {
            var error = !isMatch ? ES.e(User.ERROR.USER_WRONG_PASSWORD, err) : null;
            if(callback) return callback(error, isMatch);
        });
    } else {
        var isMatch = this.password == candidate;
        var error = !isMatch ? ES.e(User.ERROR.USER_WRONG_PASSWORD) : null;
        if(callback) return callback(error, isMatch);
    }
}

User.Schema.pre("save", function(next) {
    var user = this;

    // status settings
    if(user.isNew && user.isAnonymous) {
        user.status = User.STATUS.ANONYMOUS;
    }
    else if(user.isModified("email")) {
        user.status = user.forcestatus || User.STATUS.CONFIRM;
    }
    else {
        user.status = user.forcestatus || user.status || User.STATUS.CONFIRM;
    }

    user.label = user.label || user.email && user.email.substr(0, user.email.indexOf("@"));

    if(USING_ENCRIPT) {
        // only hash the password if it has been modified (or is new)
        if (!user.isModified("password")) return next();

        // generate a salt
        _bcrypt.genSalt(SALT_WORK_FACTOR || 10, function(err, salt) {
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

var UserModel = _mongoose.model("User", User.Schema);

/**
 * @function Create
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
User.Create = function(user, callback) {
    if(!user || !user.email || !user.password) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS), false);
        return;
    }

    var newuser = new UserModel();
    newuser.email = user.email;
    newuser.label = user.label;
    newuser.password = user.password;
    newuser.name = user.name;
    newuser.birthday = user.birthday;
    newuser.since = user.since;
    newuser.lastlogin = user.lastlogin;
    newuser.gender = user.gender;
    newuser.origin = user.origin;
    newuser.profile = user.profile;
    newuser.lang = user.lang;
    newuser.status = user.status;
    newuser.forcestatus = user.forcestatus;
    newuser.passport = [];
    newuser.favorite = [];
    newuser.history = [];

    newuser.save(callback);
}

/**
 * @function CreateAnonymous
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
User.CreateAnonymous = function(callback) {
    var newuser = new UserModel();
    newuser.email = newuser.id + "@anonymous.com";
    newuser.password = "a";
    newuser.isAnonymous = true;

    newuser.save(callback);
}

/**
 * @function Update
 * @param user object User with newmail possibility
 * @param callback function Callback params (error, oldUserProperties)
 */
User.Update = function (user, callback) {
    if(!user || !user.email) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS), false);
        return;
    } 

    var oldmail = user.email;
    User.Get(oldmail, function(err, savedUser) {
        if(err || !savedUser) {
            if(callback) callback(ES.e(User.ERROR.USER_NOTFOUND, err));
            return;
        }
        var newemail = user.newemail || user.email;
        user.email = newemail;
        savedUser = Object.assign(savedUser, user);
        savedUser.save(callback);
    });
}

/**
 * @function Remove
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error)
 */
User.Remove = function (where, callback) {
    UserModel.remove(where, callback);
}

/**
 * @function Find
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error, users)
 */
User.Find = function(where, callback) {
    return UserModel.find(
        where, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, users) {
            if(err || !users) {
                err = ES.e(User.ERROR.USER_NOTFOUND, err);
            }
            if(callback) callback(err, users);
        }
    );
}

/**
 * @function Get
 * @param email User email
 * @param callback function Callback params (error, users)
 */
User.Get = function(email, callback) {
    if(!email) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
        return;
    }

    return UserModel.findOne(
        {email:email}, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, user) {
            if(err || !user) {
                err = ES.e(User.ERROR.USER_NOTFOUND, err);
            }
            if(callback) callback(err, user);
        }
    );
}

/**
 * Purge the users with 'status'' from 'days'
 * 
 * @param status enum User.STATUS option
 * @param days number To purge all ANONYMOUS users registered more than 'days'
 * @param callback function Callback params (error)
 */
User.Purge = function(days, status, callback) {
    if(days == null || !status) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
        return;
    }
    var where = {status:status};
    if(days) where.since = {$lt : _moment().subtract(days, "days")};

    UserModel.remove(where, callback);
}

/**
 * Purge the users with 'status'' from 'days'
 * 
 * @param status enum User.STATUS option
 * @param days number To purge all ANONYMOUS users registered more than 'days'
 * @param callback function Callback params (error)
 */
User.Confirm = function(token, callback) {
    if(!token) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
        return;
    }

    User.Find({_id:token}, function(err, users) {
        var user = users && users.length ? users[0] : null;
        if(!user) {
            if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
            return;
        }

        user.status = User.STATUS.OFF;
        user.save(callback);
    });
}

/**
 * Login
 * 
 * @param email string User email
 * @param password string User password
 * @param callback function Callback params (error, user)
 */
User.Login = function (email, password, callback) {
    if(!email || !password) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
        return;
    }

    return UserModel.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(ES.e(User.ERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.ComparePassword(password, function(err, match) {
            if(err) {
                if(callback) callback(err, user);
                return;
            }

            switch (user.status) {
                case User.STATUS.CONFIRM:
                    err = ES.e(User.ERROR.USER_CONFIRMATION);
                    break;
                case User.STATUS.BLOCK:
                    err = ES.e(User.ERROR.USER_BLOCKED);
                    break;
                case User.STATUS.OFF:
                    user.status = User.STATUS.ON;
                    user.lastlogin = _moment();
                    user.save();
                    break;
                default:
                    break;
            }

            if(callback) callback(err, user);
        });
    });
}

/**
 * Logout
 * 
 * @param email string User email
 * @param password string User password
 * @param callback function Callback params (error, user)
 */
User.Logout = function(email, callback) {
     if(!email) {
        if(callback) callback(ES.e(User.ERROR.USER_PARAMS));
        return;
    }

    return UserModel.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(ES.e(User.ERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.status = User.STATUS.OFF;
        user.save(callback);
    });
}