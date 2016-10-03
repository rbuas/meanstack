var _nodemailer = require("nodemailer");

var Log = require("../brain/log");

var _defaultoptions = {
    smtp = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL 
        auth: {
            user: 'rodrigobuas@gmail.com',
            pass: 'pass'
        }
    }
}

module.exports = WebMailer;
function WebMailer (server) {
    var self = this;
    self.options = Object.assign(_defaultoptions, options) || {};
    self.transporter = nodemailer.createTransport(self.options.smtp);
    self.templates = {};
}

WebMailer.ERROR = {
    
};

WebMailer.ERRORMESSAGE = {
    
};

var ES = new Error(WebMailer.ERRORMESSAGE);

/**
 * send 
 * @param options object {
 *      from : string,
 *      to : string,
 *      subject : string,
 *      data : object,
 *      template : string filename,
 *      mode : html | text
 * }
 * @param callback function (err, info)
 */

WebMailer.prototype.send = function(options , callback) {
    var self = this;
    var sendoptions = {};
    sendoptions.to = options.to;
    sendoptions.from = options.from;
    sendoptions.subject = options.subject;
    if(options.mode == "HTML") {
        sendoptions.html = getHTML(self, options.template, options.data);
    } else {
        sendoptions.text = options.data;
    }
    self.transporter.sendMail(sendoptions, callback);
}



// PRIVATE
function getHTML(self, template, data) {
    //TODO
}