
function sqlTest() {

    //USAGE:  type  sqlTest()   into console
    //ERROR INSPECTION:  under "Network" a red queryObejct


    var fusionTableId = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var googleApiKey = "AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo";

    var queryStr = [];
    queryStr.push("SELECT countryCode, COUNT() as numberOfCities, SUM(population) AS populationSum," +
    " MINIMUM(longitude) AS countryMinLong, MAXIMUM(longitude) AS countryMaxLong "); //ERROR_503:    , MINIMUM(latitude) AS countryMinLat, MAXIMUM(latitude) AS countryMaxLat
    queryStr.push(" FROM " + fusionTableId);
    queryStr.push(" WHERE SUM(population) > 58748300 and countryCode = 'DE'"); // <- THIS DOESNT WORK. SCREW FUSION LAYER
    queryStr.push(" GROUP BY countryCode");


    //###EXAMPLES###:
    //queryStr.push(" WHERE population>1000000");
    //queryStr.push(" WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(37.4, -122.1), 500))");



    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({
        url: "https://www.googleapis.com/fusiontables/v1/query?sql=" + sql + "&key=" + googleApiKey,
        dataType: "json"
    }).done(function (response) {
        console.log('\nSQL_QUERY_TEST:');
        console.log(response);
    });


}