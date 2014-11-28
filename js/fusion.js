/**
 * Created by Stefan on 26.11.2014.
 */
var map, layer;

function initialize() {

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
        zoom: 3,
        mapTypeControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE

    });
    var style =[
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [
                { visibility: 'off' }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "labels",
            "stylers": [
                { "visibility": "off" }
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
    var max = 10;
    var x = Math.floor(Math.random() * (max - min)) + min;

    layer = new google.maps.FusionTablesLayer({
        query: {
            select: "col1",
            from: "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2",
            where: "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27",
            //order_by: "RAND()",
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

}
