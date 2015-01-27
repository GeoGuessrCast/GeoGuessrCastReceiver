(function(gmm){

    var layer, geocoder;
    var markers = []; //Google Map Marker
    var infobubbles = []; //Google info bubbles

    /** @type number */
    gmm.maxRounds = 5;
    /** @type number */
    gmm.currentRound = 1;

    gmm.currentGameMode = null;
    gmm.currentGameModeProfile = null;


    gmm.setGameMode = function(gameModeObject){
        gameModeManager.currentGameMode = gameModeObject;
    };

    gmm.setGameModeProfile = function(gameModeProfileObject){
        gameModeManager.currentGameModeProfile = gameModeProfileObject;
    };


    /**
     *
     */
    gmm.applyMapOptions = function(profileObject){
        console.debug("Profile: "+profileObject.profileName+ " ID: "+ profileObject.mapTypeId);

        var style = [
            {
                "featureType": "administrative.locality", // Citynames
                "elementType": "labels.text",
                "stylers": [
                    {"visibility": profileObject.mapOption.showCityNames}
                ]
            },
            {
                featureType: 'road.highway',
                elementType: 'all',
                stylers: [
                    {visibility: profileObject.mapOption.showRoads}
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels",
                "stylers": [
                    {"visibility": profileObject.mapOption.showCountryNames}
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry",
                "stylers": [
                    { "visibility": profileObject.mapOption.borders }
                ]
            }
        ];
        var styledMapType = new google.maps.StyledMapType(style, {
            map: map,
            name: 'styled-map'

        });
        map.mapTypes.set('map-style', styledMapType);
        map.setMapTypeId(profileObject.mapTypeId);
        map.setZoom(profileObject.mapOption.zoom);

    };

    /**
     * clears all markers on the map
     */
    gmm.clearMarkers = function(){
        if (layer) {
            layer.setMap(null);
        }

        markers.map(function (marker) {
            marker.setMap(null);
        });
        markers = [];
    };
    /**
     * clears all markers on the map
     */
    gmm.clearInfoBubbles = function(){

        infobubbles.forEach(function(entry) {
            entry.close();
        });
        infobubbles.map(function (bubble) {
            bubble.setMap(null);
        });
        infobubbles = [];
    };

    gmm.getMap = function(){
        return map;
    };

    gmm.getLayer = function(){
        return layer;
    };

    gmm.getGeocoder = function(){
        return geocoder;
    };

    gmm.getMarkers = function(){
        return markers;
    };

    gmm.getInfoBubbles = function(){
        return infobubbles;
    };

    /**
     * sets the current round to 1
     */
    gmm.resetGame = function(){
        gmm.currentRound = 1;
    };

    /**
     * starts a new game with config objects
     * @param {Object} profileObject
     */
    gmm.startGame = function(profileObject){
        gameModeManager.setGameModeProfile(profileObject);
        console.debug("Profile: "+profileObject);
        gmm.resetGame();

        _loadGameUi();
        geocoder = new google.maps.Geocoder();

        this.loadMap();

        this.applyMapOptions(profileObject)

        // init grm.init


        gameRoundManager.startRound( gameModeManager.currentRound ); //TODO use members
    };

    gmm.setMap = function(setter){
        map = setter;
        return map;
    };

    gmm.setLayer = function(setter){
        layer = setter;
        return layer;
    };

    gmm.setGeocoder = function(setter){
        geocoder = setter;
        return geocoder;
    };

    gmm.setMarkers = function(setter){
        markers = setter;
        return markers;
    };


    gmm.setInfoBubbles= function(setter){
        infobubbles = setter;
        return infobubbles;
    };

    gmm.loadMap = function(){
        _loadGameUi();
        geocoder = new google.maps.Geocoder();

        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
            zoom: 3,
            mapTypeControl: false,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE

        });

    };



    /**
     * loads game mode ui
     * @private
     */
    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameModeOverlay.html', function (data) {
            $(this).html(data);
            renderManager.refreshBottomScoreboard();
        });
    }

}(this.gameModeManager = this.gameModeManager || {}));