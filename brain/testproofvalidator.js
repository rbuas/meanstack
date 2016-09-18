var _fs = require("fs");
var _pixelmatch = require("pixelmatch");
var _resemble = require("node-resemble-js");
var _glob = require("glob");
var _prompt = require("prompt");
var _log = require("./log");
var PNG = require("pngjs").PNG;

module.exports.TestProofValidator = TestProofValidator;


var _defaultoptions = {
    path : __dirname + "/../tests/proof/",
    imageproof : ".proof", 
    imagediff : ".diff"
};

function TestProofValidator (options) {
    var self = this;
    self.options = Object.assign(_defaultoptions, options) || {};
    self.proofindex = 0;
    self.proofdiff = [];
    readLogs(self);
}



//PRIVATE

function readDiffs (diffs) {
    if(!diffs)
        return;

    var newdiff = [];
    for(var d in diffs) {
        if(!diffs.hasOwnProperty(d)) continue;

        var diff = diffs[d];
        if(!validateDiff(diff.truth, diff.proof, diff.diff))
            newdiff.push(diff);
    }
    return newdiff;
}

function validateDiff (truth, proof, diff) {
    var self = this;
    var replace = getUserOption(truth, proof, function(er, result) {
        var test = 4;
        if(result.newtruth == "yes" || result.newtruth == "y") {// so error will keep
            //TODO
        } else {// so good is proof
            //remove truth and diff and rename proof to truth
        }
    });
}

function getUserOption (truth, proof, callback) {
    _prompt.start();
    var newtruthSchema = {
        name: "newtruth",
        message: 'Is there a new truth ? We should replace the new proof as the truth ?',
        required: true,
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no'
    };
    var newtruth;
    _prompt.get(newtruthSchema, callback);
    return newtruth;
}

function readLogs (self) {
    if(!self)
        return;

    var list = getLogFiles(self.options.path);
    for(l in list) {
        if (!list.hasOwnProperty(l)) continue;

        var logfile = list[l];
        var logcontent = readLog(logfile);
        if(!logcontent || logcontent.status == "OK")
            continue;

        var newdiff = readDiffs(logcontent.diff);
        logcontent.status = snewdiff.length > 0 ? "DIFF" : "OK",
        logcontent.diff = newdiff;
        logcontent.diffcount = newdiff.length;
        saveLog(logfile, logcontent);
    }
}

function removeProof (file) {
    if(!_fs.existsSync(file))
        return false;

    _fs.unlink(file);
    return true;
}

function getLogFiles (dir) {
    dir = dir || ".";
    var files = _glob.sync(dir + "*.log", {});
    return files;
}

function readLog (filename) {
    var logcontent = _fs.readFileSync(filename);
    return JSON.parse(logcontent);
}

function saveLog (filename, log) {
    var logcontent = JSON.stringify(log);
    _fs.writeFileSync(filename, logcontent);
}

var newvalidator = new TestProofValidator();