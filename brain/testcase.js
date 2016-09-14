var _fs = require("fs");
var _pixelmatch = require("pixelmatch");
var _resemble = require("node-resemble-js");
var _log = require("./log");
var PNG = require("pngjs").PNG;

module.exports.TestCase = TestCase;


var _defaultoptions = {
    path : __dirname + "/proof/",
    imageproof : ".proof", 
    imagediff : ".diff", 
    pixelmatch : {
        includeAA : true,
        threshold : 0.2
    },
    tolerance : 1,
    resemble : {
        errorColor: {
            red: 255,
            green: 50,
            blue: 50
        },
        errorType: 'movement',
        transparency: 0.1
    }
};

function TestCase (suite, options) {
    var self = this;
    self.suite = suite;
    self.options = Object.assign(_defaultoptions, options) || {};
    self.proofindex = 0;
    self.proofdiff = [];
    _resemble.outputSettings(self.options.resemble);
}

TestCase.prototype.proof = function(proofname) {
    var self = this;
    if(!self.suite)
        return;

    proofname = proofname ? "." + proofname : "";
    var title = self.suite && self.suite.getFullName() || "";
    title = title.replace(/ /g, "-");
    var path = self.options.path || "";
    var filename = path + formatInt(++this.proofindex, 4) + "-" + title + proofname;
    var filetruth = filename + ".png";
    var fileproof = filename + self.options.imageproof  + ".png";
    var filediff = filename + self.options.imagediff  + ".png";

    browser.waitForAngular();
    return browser.takeScreenshot()
    .then(function(data) {
        if(!_fs.existsSync(filetruth)) {
            _fs.writeFileSync(filetruth, data, "base64");
            return;
        }
        _fs.writeFileSync(fileproof, data, "base64");
        compareProof(self, filetruth, fileproof, filediff)
        .onComplete(function(comparedata) {
            if (Number(comparedata.misMatchPercentage) <= self.options.tolerance) {
                _fs.unlink(fileproof);
            } else {
                self.proofdiff.push({truth:filetruth, proof:fileproof, diff:filediff});
                comparedata.getDiffImage().pack().pipe(_fs.createWriteStream(filediff));
                console.log("Proof '" + filetruth +  "' differ " + comparedata.misMatchPercentage + "%")
            }
        });
    });
}

TestCase.prototype.diffCount = function() {
    var self = this;
    return self.proofdiff.length;
}

TestCase.prototype.saveLog = function(id) {
    var self = this;
    var title = self.suite && self.suite.getFullName() || "diff";
    if(id) {
        title += id;
    }
    var filename = self.options.path + title + ".log";
    var diffcontent = JSON.stringify({
        count : self.proofindex,
        diff : self.proofdiff
    });
    _fs.writeFileSync(filename, diffcontent);
}



//PRIVATE

function formatInt (num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function compareProof (self, truth, proof, diff, callback) {
    if(!self)
        return;

    //_log.message("Reading truth file : ", truth);
    var imageTruth;
    try {
        imageTruth = _fs.readFileSync(truth);
    } catch(e) {
        console.log(e);
    }

    //_log.message("Reading proof file : ", proof);
    var imageProof;
    try {
        imageProof = _fs.readFileSync(proof);
    } catch(e) {
        console.log(e);
    }

    return _resemble(imageTruth)
        .compareTo(imageProof)
        //.ignoreAntialiasing()
        //.ignoreColors()
        //.ignoreRectangles([[325,170,100,40]])
        ;
        // .onComplete(function(data) {
        //     if (Number(data.misMatchPercentage) <= 0.01) {
        //         if(callback) callback();
        //     } else {
        //         data.getDiffImage().pack().pipe(_fs.createWriteStream(diff));
        //         if(callback) callback(new Error("Proof '" + image +  "' differ " + data.misMatchPercentage + "%"));
        //     }
        // });
}

function compareProofPixelMatch (self, truth, proof, diff) {
    if(!self)
        return;

    //_log.message("Reading truth file : ", truth);
    var dataT;
    try {
        dataT = _fs.readFileSync(truth);
    } catch(e) {
        console.log(e);
    }
    var imgT = PNG.sync.read(dataT);

    //_log.message("Reading proof file : ", proof);
    var dataP;
    try {
        dataP = _fs.readFileSync(proof);
    } catch(e) {
        console.log(e);
    }
    var imgP = PNG.sync.read(dataP);
    var imgD = new PNG({width: imgT.width, height: imgT.height});

    _pixelmatch(imgT.data, imgP.data, imgD.data, imgT.width, imgT.height, self.options.pixelmatch);
    if(imgD.data) {
        var buffer = PNG.sync.write(imgD);
        _fs.writeFileSync(diff, buffer);
    }
    return imgD.data;
}