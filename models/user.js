var _mongoose = require("mongoose");
var _bcrypt = require("bcrypt");
var _log = require("../brain/log");

module.exports.Shema = new _mongoose.Schema({
    username : {type:String, unique:true},
    email : {type:String, unique:true},
    password : String,
    birthday : Date,
    status : {type:String, enum:["ON", "OFF", "CONFIRM", "BLOCK"]},
    gender : {type:String, enum:["M", "F"]},
    origin : String,
    profile : {type:String, enum:["ADMIN", "EDITOR", "VIEWER"]},
    lang : String,
    token : String,
    passport : [],
    favorite : [],
    history : []
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

            var pendding = 2;

            // hash the password using our new salt
            _bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                _log.message("User password hased : " + hash);
                if(--pendding == 0) next();
            });

            _bcrypt.hash(user.email, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                _log.message("User password hased : " + hash);
                if(--pendding == 0) next();
            });
        });
    });
}

module.exports.Module = _mongoose.model("User", module.exports.Shema);

var User = _mongoose.model("User");

module.exports.Create = function(user, callback) {
    if(!user || !user.email || !user.password) {
        if(callback) callback({error:"Missing required params"});
        return;
    }

    var newuser = new User();
    newuser.username = user.username;
    newuser.email = user.email;
    newuser.password = user.password;
    newuser.birthday = user.birthday;
    newuser.status = "CONFIRM";
    newuser.gender = user.gender;
    newuser.origin = user.origin;
    newuser.profile = user.profile || "VIEWER"; 
    newuser.lang = user.lang; 
    newuser.passport = [];
    newuser.favorite = [];
    newuser.history = [];
    newuser.token = "";

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
            //TODO : save into db the user status
            if(callback) callback(err, user);
        });
    });
}

module.exports.Logout = function(email) {
    _log.message("Loggin out : ", email, "...");
    //TODO : save into db the user status
    return email;
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
                err = "Cant find users (" + err + ")";
            }
            if(callback) callback(err, users);
        }
    );
}