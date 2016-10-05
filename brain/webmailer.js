var _nodemailer = require("nodemailer");
var _hbs = require('handlebars');
var _fs = require("fs");

var Log = require("../brain/log");
var System = require("../brain/system");
var E = System.error;


module.exports = WebMailer;
function WebMailer (options) {
    var self = this;
    self.options = Object.assign(WebMailer.defaultoptions, options) || {};
    self.transporter = _nodemailer.createTransport(self.options.smtp);
    self.templates = {};
}

WebMailer.defaultoptions = {
    smtp : {
        service : "MailGun",
        domaine : "sandbox7675be11bc2a485e8ed106a5f916dfe4.mailgun.org",
        api_key : "key-f26b43fc4e32cb9911f5bc63fe312b16",
        auth: {
            user: 'postmaster@sandbox7675be11bc2a485e8ed106a5f916dfe4.mailgun.org',
            pass: 'bcda9d2c8227c18bcdeec6e6a2b90a45'
        }
    },
    templateDir : __dirname + "/../views/",
    fake : true
}

WebMailer.ERROR = {
    
};

WebMailer.ERRORMESSAGE = {
    
};
System.registerErrors(WebMailer.ERRORMESSAGE);


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
    var mail = {};
    mail.to = options.to;
    mail.from = options.from;
    mail.subject = options.subject;

    if(options.mode == "HTML") {
        mail.html = getHTML(self, options.template, options.data);
    } else {
        mail.text = options.data;
    }

    if(self.options.fake) {
        console.log("FAKE WebMailer.send : ", mail);
        if(callback) callback(null, mail);
        return;
    }
    self.transporter.sendMail(mail, callback);
}



// PRIVATE
function getHTML(self, template, data) {
    if(!self || !template) return;

    var templateCompiled = self.templates && self.templates[template];
    if(!templateCompiled) {
        var templateContent = _fs.readFileSync(self.options.templateDir + template + ".html", 'utf8');
        templateCompiled = self.templates[template] = _hbs.compile(templateContent);
        if(!templateCompiled)
            return;
    }

    var html = templateCompiled(data);
    return html;
}