/**
 * Created by Stefan on 26.11.2014.
 */
$(document).ready(function () {
    var map, layer, geocoder, ftTableId;
    var gftUrl = 'http://www.google.com/fusiontables/api/query?';
    ftTableId = "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
    var locationColumn = "col1";
    var jsonUrlTail = '&jsonCallback=?';
    var where = "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27";
    var query = 'select ' + locationColumn + ' from ' + ftTableId + ' where ' + where;
    var offset, limit;
    //google.load('visualization', '1');
    var goal,guess; //TODO: Guesses in Map Player:Place

    function initialize() {
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
            zoom: 3,
            mapTypeControl: true,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE

        });
        var style = [
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                featureType: 'road.highway',
                elementType: 'all',
                stylers: [
                    {visibility: 'off'}
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels",
                "stylers": [
                    {"visibility": "off"}
                ]
            }
        ];
        var styledMapType = new google.maps.StyledMapType(style, {
            map: map,
            name: 'Styled Map'

        });
        map.mapTypes.set('map-style', styledMapType);
        map.setMapTypeId('map-style');


        var min = 1;
        var max = 98; //TODO: dynamisch über Anzahl an Rows machen?
        var x = Math.floor(Math.random() * (max - min)) + min;
        //var query = new google.maps.FusionTablesQuery();
        layer = new google.maps.FusionTablesLayer({
            query: {
                select: locationColumn,
                from: ftTableId,
                where: where,
                //orderBy: "RAND()",
                offset: x,
                limit: "1"
            },
            options: {
                styleId: 1,
                templateId: 1
            }

        });

        //map.panTo(new google.maps.)
        layer.setMap(map);
        console.log("Done");
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler

        var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
        var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';

        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE "+where+" OFFSET "+ x+" LIMIT 1";
        console.log(query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        var jqxhr = $.get(queryurl, dataHandler, "jsonp");

    }
    var rad = function(x) {
        return x * Math.PI / 180;
    };

    var getDistance = function(p1, p2) {
/*        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;*/
        return google.maps.geometry.spherical.computeDistanceBetween (p1, p2);; // returns the distance in meter
    };
    function dataHandler(response) {
        //do something with the data using response.rows
        var address = response.rows[0][0];
        console.log(address);
        zoomToAddress(address);
    }


    var setMarker = function (pos,player){
        var marker = new google.maps.Marker({
            position: pos,
            //map: map,
            title: "Player: "+player,
            animation: google.maps.Animation.DROP
        });
        marker.setMap(map);
    };

    function calculateGuess(address, player) {
        // get Geolocation
        // set Marker
        console.debug("get Address")
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                console.log("Pos: "+pos);
                setMarker(pos, player);
                guess = pos;
                if (guess == goal){
                    console.log("richtig");
                }
                // get Distance to right answer (if not the same)
                var dist = getDistance(guess,goal);
                console.log("Dist: "+dist);
                // profit


            } else {
                window.alert('Address could not be geocoded: ' + status);
            }
        });
    };
    var zoomToAddress = function (address) {
        console.debug("Clicked on Go")
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                map.setCenter(pos);
                map.setZoom(5);
                goal = pos;
            } else {
                window.alert('Address could not be geocoded: ' + status);
            }
        });
    };

    google.maps.event.addDomListener(document.getElementById('search'),
        'click', function (e) {
                var address = document.getElementById('address').value;


                calculateGuess(address,"Stefan");
                //zoomToAddress(address);
        });


    google.maps.event.addDomListener(window, 'keypress', function (e) {
        if (e.keyCode == 13) {
            var address = document.getElementById('address').value;

            zoomToAddress(address);

        }
    });
//TODO: Change style of Marker?
    google.maps.event.addDomListener(document.getElementById('style'),
        'change', function () {
            var selectedStyle = this.value;
            layer.set('styleId', selectedStyle);
        });

    google.maps.event.addDomListener(document.getElementById('template'),
        'change', function () {
            var selectedTemplate = this.value;
            layer.set('templateId', selectedTemplate);
        });

    google.maps.event.addDomListener(window, 'load', initialize);

}); // END jQuery ON READY