var Log = require(ROOT_DIR + "/brain/log");
var Quote = require(ROOT_DIR + "/models/quote");

module.exports = QuoteRoute = {};

QuoteRoute.quote = function(req, res) {
    var quoteid = req.params.quote;

    if(!quoteid) {
        res.status("404").send("ERROR: can not find quote param");
        return;
    }

    Quote.GetByObjectId(quoteid, function(err, quote) {
        var response = {};
        if(err || !quote) {
            Log.message("quote.get failure", err);
            response.error = err;
        } else {
            Log.message("quote.get success", quoteid);
            response.success = Quote.MESSAGE.QUOTE_SUCCESS;
            response.quote = quote;
        }
        res.json(response);
    });
}

QuoteRoute.quotes = function(req, res) {
    var category = req.params.category;
    Quote.Random({category:category}, 1, function(err, quotes) {
        var response = {};
        if(err || !quotes) {
            Log.message("quote.random failure", err);
            response.error = err;
        } else {
            Log.message("quote.random success", category);
            response.success = Quote.MESSAGE.QUOTE_SUCCESS;
            response.quotes = quotes;
        }
        res.json(response);
    });
}