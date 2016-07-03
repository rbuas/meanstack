var _quotes = [
    {"author": "Ansel Adams","text": "You don't make a photograph just with a camera. You bring to the act of photography all the pictures you have seen, the books you have read, the music you have heard, the people you have loved."},
    {"author": "Ernst Haas","text": "I am not interested in shooting new things – I am interested to see things new."},
    {"author": "Ted Grant","text": "When you photograph people in color, you photograph their clothes. But when you photograph people in Black and white, you photograph their souls."},
    {"author": "Ansel Adams","text": "You don’t take a photograph, you make it."},
    {"author": "Ansel Adams","text": "To the complaint, 'There are no people in these photographs,' I respond, There are always two people: the photographer and the viewer."},
    {"author": "Henri Cartier-Bresson","text": "Your first 10,000 photographs are your worst."},
    {"author": "Henri Cartier-Bresson","text": "To photograph: it is to put on the same line of sight the head, the eye and the heart."},
    {"author": "Henri Cartier-Bresson","text": "Photographier c’est mettre sur la même ligne de mire la tête, l’oeil et le coeur."},
    {"author": "John Stuart Mill","text": "La photographie est une brève complicité entre la prévoyance et le hasard."},
    {"author": "Henri Cartier-Bresson","text": "To me, photography is the simultaneous recognition in a fraction of a second of the significance of an event."},
    {"author": "Robert Frank","text": "The eye should learn to listen before it looks."},
    {"author": "Tim Walker","text": "Only photograph what you love."},
    {"author": "Ralph Gibson","text": "Une photographie forte, ce n’est plus l’image de quelque chose, c’est quelque chose en soi."}
];

module.exports.quote = function(req, res) {
    var quoteid = req.params.quote;
    console.log("Route to quote : ", quoteid);

    if(!quoteid) {
        res.status("404").send("ERROR: can not find quote param");
        return;
    }

    var quote = _quotes.length > quoteid ? _quotes[quoteid] : null;
    if(!quote) {
        res.status("404").send("ERROR: can not find quote " + quoteid);
        return;
    }

    quote.layout = "pure";
    res.render("quotes", quote);
}

module.exports.quotes = function(req, res) {
    var randomindex = Math.floor((Math.random() * _quotes.length) + 1);
    console.log("randomindex : ", randomindex);

    var quote = _quotes[randomindex - 1];
    console.log("quotes : ", quote);

    quote.layout = "pure";
    res.render("quotes", quote);
}