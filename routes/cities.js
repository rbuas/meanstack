var _cities = {
    "berlin" : {
        label : "Berlin",
        headline : "Berlin: Where love is in the air",
        images : 4
    },
    "paris" : {
        label : "Paris",
        headline : "Paris: Good talkers are only found in Paris",
        images : 4
    },
    "madrid" : {
        label : "Madrid",
        headline : "Madrid: Buzz, Beautiful architecture and Football",
        images : 4
    },
    "london" : {
        label : "London",
        headline : "London: Sparkling, Still, Food, Gorgeous",
        images : 4
    },
    "newyork" : {
        label : "New York",
        headline : "New York: Come to New York to become someone new",
        images : 6
    }
};


module.exports.city = function(req, res) {
    var city = req.params.city || "";
    var viewdata = {
        cities:_cities,
        city: city,
        metatitle: 'iLoveMyCity',
        title: 'iLoveMyCity',
        headline: 'Can not found this city' + city
    };
    var cityObject = _cities[city];
    if(city && cityObject) {
        viewdata.title = viewdata.title + " / " + cityObject.label;
        viewdata.headline = cityObject.headline;
        viewdata.cityimages = [1, 2, 3, 4];
    }
    res.render("city", viewdata);
}

module.exports.cities = function(req, res) {
    var viewdata = {
        cities:_cities,
        metatitle: 'iLoveMyCity',
        title: 'iLoveMyCity',
        headline: 'We believe that every city have something to say'
    };
    res.render("cities", viewdata);
}