module.exports = Error;

/*******
 * @system Error
 * @param config table ERROR_CODE : ERROR_DESCRIPTION
 */
function Error (config) {
    var self = this;
    self.config = Object.assign({}, config);
}

Error.prototype.e = function (code, detail) {
    var self = this;
    var error = self.config[code];
    var message = error || "";
    if(detail)
        message += "(" + detail + ")";

    return {code:code, detail:message};
}