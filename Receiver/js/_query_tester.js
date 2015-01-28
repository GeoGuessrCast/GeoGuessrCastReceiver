
function sqlTest() {


    var fusionTableId = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var googleApiKey = "AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo";

    var queryStr = [];
    queryStr.push("SELECT * ");
    queryStr.push(" FROM " + fusionTableId);
    queryStr.push(" WHERE population>1000000");

// queryStr.push(" WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(37.4, -122.1), 500))");

    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({
        url: "https://www.googleapis.com/fusiontables/v1/query?sql=" + sql + "&key=" + googleApiKey,
        dataType: "json"
    }).done(function (response) {
        console.debug('\nSQL_QUERY_TEST:');
        console.debug(response);
    });


}