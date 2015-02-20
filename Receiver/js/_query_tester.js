
// PERFECT DOCUMENTATION:
// https://developers.google.com/fusiontables/docs/v2/sql-reference


function sqlTest() {

    //USAGE:  type  sqlTest()   into console
    //ERROR INSPECTION:  under "Network" a red queryObejct


    var cityTable = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var countryTable = "1Gf74ezjOHKaVxS_vF9PtbJc5yTfm8a6JsuxHGjzD";
    var googleApiKey = "AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo";

    var queryStr = [];


    //queryStr.push("SELECT countryCode, COUNT() as numberOfCities, SUM(population) AS populationSum," +
    //" MINIMUM(longitude) AS countryMinLong, MAXIMUM(longitude) AS countryMaxLong "); //ERROR_503:    , MINIMUM(latitude) AS countryMinLat, MAXIMUM(latitude) AS countryMaxLat
    //queryStr.push(" FROM " + cityTable);
    //queryStr.push(" WHERE SUM(population) > 58748300 and countryCode = 'DE'"); // <- THIS DOESNT WORK. SCREW FUSION LAYER
    //queryStr.push(" GROUP BY countryCode");


    //COUNTRY TABLE: https://www.google.com/fusiontables/embedviz?viz=GVIZ&t=TABLE&q=select+col0%2C+col1%2C+col3%2C+col4%2C+col5%2C+col7%2C+col8%2C+col10%2C+col17+from+1Gf74ezjOHKaVxS_vF9PtbJc5yTfm8a6JsuxHGjzD+where+col3+%3E%3D+1+order+by+col3+desc&containerId=googft-gviz-canvas
    queryStr.push("SELECT countries.name AS countryName, cities.name AS cityName, countries.population AS countryPopByTable");
    queryStr.push(" FROM " + countryTable + " AS countries");
    queryStr.push(" LEFT OUTER JOIN " + cityTable + " AS cities");
    queryStr.push(" ON countries.countryCode = cities.countryCode");
    queryStr.push(" WHERE countries.relevance > 2 AND cities.population > 10927980");


    //###EXAMPLES###:
    //queryStr.push(" WHERE population>1000000");
    //queryStr.push(" WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(37.4, -122.1), 500))");



    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({
        url: "https://www.googleapis.com/fusiontables/v2/query?sql=" + sql + "&key=" + googleApiKey,
        dataType: "json"
    }).done(function (response) {
        console.log('\nSQL_QUERY_TEST:');
        console.log(response);
    });


}