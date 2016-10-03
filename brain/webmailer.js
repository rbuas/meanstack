var _nodemailer = require("nodemailer");

var Log = require("../brain/log");

var _defaultoptions = {
    smtp : {
        service : "MailGun",
        domaine : "sandbox7675be11bc2a485e8ed106a5f916dfe4.mailgun.org",
        api_key : "key-f26b43fc4e32cb9911f5bc63fe312b16",
        auth: {
            user: 'postmaster@sandbox7675be11bc2a485e8ed106a5f916dfe4.mailgun.org',
            pass: 'bcda9d2c8227c18bcdeec6e6a2b90a45'
        }
    }
}

module.exports = WebMailer;
function WebMailer (options) {
    var self = this;
    self.options = Object.assign(_defaultoptions, options) || {};
    self.transporter = _nodemailer.createTransport(self.options.smtp);
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