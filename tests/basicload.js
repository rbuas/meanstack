var _expect = require("chai").expect;
var _assert = require("chai").assert;
var _log = require("../libs/log");
var _wdc = require("../libs/webdronecentral");

describe("basicload", function() {
    var wdc;

    before(function() {
        // runs before all tests in this block
        _log.message("qsdqdqlkqs");
        wdc = new _wdc.WebDroneCentral();
    });

    after(function() {
        // runs after all tests in this block
        _log.message("loadstats:", wdc.stats);
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    it("loadpage google once", function(done) {
        wdc.analyseLink("google.com", 1, function(res){
            _log.message("loadpage stats : ", res);
            done();
        });
    });

    it("loadpage google many", function(done) {
        wdc.analyseLink("google.com", 10, function(res){
            _log.message("loadpage stats : ", res);
            done();
        });
    });

    // it("checkdata", function() {
    //     var result = "a";
    //     _expect(result).to.equal("b");
    // });
});