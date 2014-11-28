(function(castReceiver){

castReceiver.init = function(parameters){
    var map = window.map;
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

}(this.gameMode_1 = this.gameMode_1 || {}));
