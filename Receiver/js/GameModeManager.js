(function(gmm){

    var layer, geocoder;
    var markers = []; //Google Map Marker

    /** @type number */
    gmm.maxRounds = 5;
    /** @type number */
    gmm.currentRound = 1;
    /** @type number */
    gmm.currentGameId = 1;


    // constants
    gmm.gm1 = {
        gameModeName: 'City Guessing',
        id: 1,
        iconUrl: '../images/city.png'
    };

    gmm.p1 = {
        profileName: 'borders + no choices',
        id: 1,
        mapOption: {
            mapType : google.maps.MapTypeId.SATELLITE  //TODO
        }
    };

    /**
     *
     */
    gmm.applyMapOptions = function(gameModeObject, profileObject){
        this.loadMap(gameModeObject, profileObject);

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


    /**
     * sets the current round to 1
     */
    gmm.resetGame = function(){
        gmm.currentRound = 1;
    };

    /**
     * starts a new game with config objects
     * @param {Object} gameModeObject
     * @param {Object} profileObject
     */
    gmm.startGame = function(gameModeObject, profileObject){
        gmm.resetGame();
        this.loadMap(gameModeObject, profileObject);
        // init grm.init

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


    gmm.loadMap = function(gameModeObject, profileObject){
        _loadGameUi();
        geocoder = new google.maps.Geocoder();

        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
            zoom: 3,
            mapTypeControl: false,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE

        });
        var style = [
            {
                "featureType": "administrative",
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

        gameRoundManager.startRound( gameModeManager.currentRound ); //TODO use members
    };



    /**
     * loads game mode ui
     * @private
     */
    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameModeOverlay.html', function (data) {
            $(this).html(data);
            userManager.refreshBottomScoreboard();
        });
    }

}(this.gameModeManager = this.gameModeManager || {}));