var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _moment = require("moment");

var JsExt = require("../brain/jsext");
var Log = require("../brain/log");
var System = require("../brain/system");
var E = System.error;
var WebMailer = require("../brain/webmailer");
var Dictionary = require("../brain/dictionary");
var I = Dictionary.get;

module.exports = User = {};

User.SALT_WORK_FACTOR = 10;
User.USING_ENCRIPT = true;
User.VERBOSE = true;

User.STATUS = {
    ON : "ON",
    OFF : "OF",
    CONFIRM : "CF",
    BLOCK : "BL",
    ANONYMOUS : "AN",
    REMOVED : "RM"
};
User.GENDER = {
    M : "M",
    MALE : "M",
    F : "F",
    FAMALE : "F"
};
User.PROFILE = {
    ADMIN : "AD",   //backoffice administrator
    EDITOR : "ED",  //middleoffice editor manager
    WRITER : "WR",  //middleoffice writer
    GUEST : "GS",   //middleoffice guest
    CLIENT : "CL"   //frontoffice client
};
User.ERROR = System.registerErrors({
    USER_WRONG_PASSWORD : "The password not match with registered password",
    USER_PARAMS : "Missing required params",
    USER_NOTFOUND : "Cant find the user",
    USER_UNKNOW : "Unknow user",
    USER_CONFIRMATION : "Waiting confirmation",
    USER_BLOCKED : "User blocked",
    USER_REMOVED : "User removed",
    USER_TOKEN : "User token doesn't match"
});
User.MESSAGE = System.registerMessages({
    USER_SUCCESS : "Operation success"
})

User.Mailer = new WebMailer();

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

/**
 * ComparePassword
 * @param candidate string Password candidate
 * @param callback function Callback params (error, isMatch)
 */
User.Schema.methods.ComparePassword = function(candidate, callback) {
    if(User.USING_ENCRIPT) {
        _bcrypt.compare(candidate, this.password, function(err, isMatch) {
            var error = !isMatch ? E(User.ERROR.USER_WRONG_PASSWORD, err) : null;
            if(callback) return callback(error, isMatch);
        });
    } else {
        var isMatch = this.password == candidate;
        var error = !isMatch ? E(User.ERROR.USER_WRONG_PASSWORD) : null;
        if(callback) return callback(error, isMatch);
    }
}

User.Schema.pre("save", function(next) {
    var user = this;
    var mustConfirm = false;

    // status settings
    if(user.isNew && user.isAnonymous) {
        user.status = User.STATUS.ANONYMOUS;
    }
    else if(user.isModified("email")) {
        user.status = user.forcestatus || User.STATUS.CONFIRM;
        if(user.status == User.STATUS.CONFIRM) {
            mustConfirm = true;
        }
    }
    else {
        user.status = user.forcestatus || user.status || User.STATUS.CONFIRM;
    }

    if(user.isModified("birthday")) {
        var inputBirthday = user.birthday;

    }

    user.label = user.label || user.email && user.email.substr(0, user.email.indexOf("@"));

    if(User.USING_ENCRIPT) {
        // only hash the password if it has been modified (or is new)
        if (!user.isModified("password")) return next();

        // generate a salt
        _bcrypt.genSalt(User.SALT_WORK_FACTOR || 10, function(err, salt) {
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

    if(mustConfirm) {
        User.Mailer.send({
            to : user.email,
            subject : I("USER_MAILCONFIRM_SUBJECT", user.lang),
            from : I("USER_MAILFROM", user.lang),
            mode : "HTML",
            data : {
                useremail : user.email,
                username : user.name,
                confirmlink : "TODO",
                title : I("USER_MAILCONFIRM_TITLE", user.lang),
                pretext : I("USER_MAILCONFIRM_PRETEXT", user.lang),
                postext : I("USER_MAILCONFIRM_POSTEXT", user.lang),
            },
            template : "mail_confirm"
        }, function(err, info) {
            if(User.VERBOSE && err)
                Log.trace("USER.SCHEMA.PRESAVE : error on send mail to " + user.email, err);
        });
    }
});

User.DB = _mongoose.model("User", User.Schema);

/**
 * Create
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
User.Create = function(user, callback) {
    if(!user || !user.email || !user.password) {
        if(callback) callback(E(User.ERROR.USER_PARAMS, user), null);
        return;
    }

    var newuser = new User.DB();
    newuser.email = user.email;
    newuser.label = user.label;
    newuser.password = user.password;
    newuser.name = user.name;
    newuser.birthday = user.birthday && _moment.utc(user.birthday, "MM-DD-YYYY");
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
 * CreateAnonymous
 * @param user object
 * @param callback function Callback params (error, savedUser)
 */
User.CreateAnonymous = function(callback) {
    var newuser = new User.DB();
    newuser.email = newuser.id + "@anonymous.com";
    newuser.password = "a";
    newuser.isAnonymous = true;

    newuser.save(callback);
}


/**
 * Update
 * @param user object User with newmail possibility
 * @param callback function Callback params (error, oldUserProperties)
 */
User.Update = function (user, callback) {
    if(!user || !user.email) {
        if(callback) callback(E(User.ERROR.USER_PARAMS), false);
        return;
    } 

    var oldmail = user.email;
    User.Get(oldmail, function(err, savedUser) {
        if(err || !savedUser) {
            if(callback) callback(E(User.ERROR.USER_NOTFOUND, err));
            return;
        }
        var newemail = user.newemail || user.email;
        user.email = newemail;
        savedUser = Object.assign(savedUser, user);
        savedUser.save(callback);
    });
}


/**
 * Remove
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error)
 */
User.Remove = function (where, callback) {
    User.DB.remove(where, callback);
}


/**
 * SoftRemove Remove user from the system but keep in memory.
 * 
 * @param token string token (id) to confirm user
 * @param callback function Callback params (error, savedUser)
 */
User.SoftRemove = function(email, password, callback) {
    if(!email || !password) {
        if(callback) callback(E(User.ERROR.USER_PARAMS), null);
        return;
    }

    User.DB.findOne({email:email}, function(err, user) {
        if(!user) {
            if(callback) callback(E(User.ERROR.USER_UNKNOW), null);
            return;
        }

        user.ComparePassword(password, function(err, match) {
            if(err) {
                if(callback) callback(err, user);
                return;
            }

            user.status = User.STATUS.REMOVED;
            user.save(callback);
        });
    });
}


/**
 * Restore Restore a soft removed user.
 * 
 * @param token string token (id) to confirm user
 * @param callback function Callback params (error, savedUser)
 */
User.Restore = function(email, callback) {
    if(!email) {
        if(callback) callback(E(User.ERROR.USER_PARAMS), null);
        return;
    }

    User.DB.findOne({email:email}, function(err, user) {
        if(!user) {
            if(callback) callback(E(User.ERROR.USER_UNKNOW), null);
            return;
        }

        user.status = User.STATUS.OFF;
        user.save(callback);
    });
}


/**
 * Find
 * @param where User properties in where syntaxe
 * @param callback function Callback params (error, users)
 */
User.Find = function(where, callback) {
    if(where.name) where.name = new RegExp(RegExp.escape(where.name), 'i');
    if(where.email) where.email = new RegExp(RegExp.escape(where.email), 'i');
    if(where.label) where.label = new RegExp(RegExp.escape(where.label), 'i');
    if(where.since) where.since = {$gt : where.since};
    if(where.lastlogin) where.lastlogin = {$gt : where.lastlogin};

    return User.DB.find(
        where, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, users) {
            if(err || !users) {
                err = E(User.ERROR.USER_NOTFOUND, err);
            }
            if(callback) callback(err, users);
        }
    );
}


/**
 * Get
 * @param email User email
 * @param callback function Callback params (error, users)
 */
User.Get = function(email, callback) {
    if(!email) {
        if(callback) callback(E(User.ERROR.USER_PARAMS));
        return;
    }

    return User.DB.findOne(
        {email:email}, 
        {password:0, token:0, history:0, __v:0}, 
        function(err, user) {
            if(err || !user) {
                err = E(User.ERROR.USER_NOTFOUND, err);
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
        if(callback) callback(E(User.ERROR.USER_PARAMS));
        return;
    }
    var where = {status:status};
    if(days) where.since = {$lt : _moment().subtract(days, "days")};

    User.DB.remove(where, callback);
}


/**
 * Confirm the users with 'status'' from 'days'
 * 
 * @param token string token (id) to confirm user
 * @param callback function Callback params (error, savedUser)
 */
User.Confirm = function(token, callback) {
    if(!token) {
        if(callback) callback(E(User.ERROR.USER_PARAMS), null);
        return;
    }

    User.Find({_id:token}, function(err, users) {
        var user = users && users.length ? users[0] : null;
        if(!user) {
            if(callback) callback(E(User.ERROR.USER_PARAMS), null);
            return;
        }

        user.status = User.STATUS.OFF;
        user.save(callback);
    });
}


/**
 * GetResetToken
 * 
 * @param email string User email id
 * @param callback function Callback params (error, token)
 */
User.GetResetToken = function(email, callback) {
    if(!email) {
        if(callback) callback(E(User.ERROR.USER_PARAMS), null);
        return;
    }

    return User.DB.findOne(
        {email:email}, 
        function(err, user) {
            var token = null;
            if(err || !user) {
                err = E(User.ERROR.USER_NOTFOUND, err);
            } else {
                token = user.password;
            }
            if(callback) callback(err, token);
        }
    );
}


/**
 * ResetPassword
 * 
 * @param email string User email id
 * @param token string token (password) to reset user password
 * @param newuser string New user password
 * @param callback function Callback params (error)
 */
User.ResetPassword = function(email, token, newpassword, callback) {
    if(!email || !token || !newpassword) {
        if(callback) callback(E(User.ERROR.USER_PARAMS));
        return;
    }

    User.DB.findOne({email:email}, function(err, user) {
        if(!user) {
            if(callback) callback(E(User.ERROR.USER_PARAMS));
            return;
        }

        if(token != user.password) {
            if(callback) callback(E(User.ERROR.USER_TOKEN));
            return;
        }

        user.password = newpassword;
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
        if(callback) callback(E(User.ERROR.USER_PARAMS));
        return;
    }

    return User.DB.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(E(User.ERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.ComparePassword(password, function(err, match) {
            if(err) {
                if(callback) callback(err, user);
                return;
            }

            switch (user.status) {
                case User.STATUS.CONFIRM:
                    err = E(User.ERROR.USER_CONFIRMATION);
                    break;
                case User.STATUS.BLOCK:
                    err = E(User.ERROR.USER_BLOCKED);
                    break;
                case User.STATUS.REMOVED:
                    err = E(User.ERROR.USER_REMOVED);
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
        if(callback) callback(E(User.ERROR.USER_PARAMS));
        return;
    }

    return User.DB.findOne({email:email}, function(err, user) {
        if(err || !user) {
            if(callback) callback(E(User.ERROR.USER_NOTFOUND, err), user);
            return;
        }
        user.status = User.STATUS.OFF;
        user.save(callback);
    });
}