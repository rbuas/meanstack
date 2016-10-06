var _fs = require("fs");

module.exports = System = {};

System.errorconfig = {};

/**
 * registerErrors
 * @param errorconfig table ERROR_CODE : ERROR_DESCRIPTION
 */
System.registerErrors = function (errorconfig) {
    System.errorconfig = Object.assign(System.errorconfig, errorconfig);
}

/**
 * error
 * @param code string ERROR_CODE
 * @param detail string ERROR_DESCRIPTION
 */
System.error = function (code, detail) {
    var error = System.errorconfig[code];
    var message = error || "";
    if(detail)
        message += "(" + detail + ")";

    return {code:code, detail:message};
}

/**
 * version Returns de version object registered in file version.json 
 */
System.version = function() {
    var version = JSON.parse(_fs.readFileSync('version.json', 'utf8'));
    return version;
}