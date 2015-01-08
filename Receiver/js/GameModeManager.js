(function(gmm){

    var map, layer, geocoder;
    //Fusion Table ID:
    var ftTableId = "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
    var locationColumn = "col1";
    var where = "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27";
    var goal;
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var guesses = {}; // Map UserID:Distanz zum Ziel
    var positions = {}; //Map UserID:LatLong Position
    var results = {}; // Map UserId:Points
    var markers = []; //Google Map Marker
    var gameState;
    var min = 1;
    var max = 98; //TODO use COUNT query in dataManager

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
        mapOption: {
            mapType : google.maps.MapTypeId.SATELLITE  //TODO
        }
    };

    /**
     *
     */
    gmm.applyMapOptions = function(gameMode, profile){

    };

    /**
     * clears all markers on the map
     */
    gmm.clearMarkersOnMap = function(){
        if (layer) {
            layer.setMap(null);
        }

        markers.map(function (marker) {
            marker.setMap(null);
        });
        markers = [];
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

    /**
     * increases the current round
     */
    //gmm.incCurrentRound = function(){
    gmm.prepareNextRound = function(){

        // check if max rounds reached
        if(gmm.currentRound === gmm.maxRounds) {
            // end game mode
            var data = {"ended": true, "event_type":"game_ended"};
            eventManager.broadcast(data.channelName.game, data);

            mainMenu.init();
            // todo fm show final scoreboard
        } else {
            // next round...
            gmm.currentRound = gmm.currentRound + 1;

            setTimeout(function(){
                //gameMode_1.startRound(gmm.currentRound);
                gameRoundManager.startRound();
            }, 10000);
        }
    };

    gmm.loadMap = function(gameMode, profile){
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
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        gameState = "initialized"; //TODO use external ENUM
        console.log('gameMode_1 initialized');

        gameModeManager.startRound( gameModeManager.currentRound ); //TODO use members
    };

    /**
     * sets the Id of the current GameMode
     * @param {number} gameModeId
     */
    gmm.setGameMode = function(gameModeId){
        dataManager.setValue('gameMode_currentId', gameModeId);
        // call mode function
        // init game mode statically

        switch(gameModeId){
            case 1:
                gameMode_1.init();
                //gameRoundManager.init(gmm.gm1, gmm.p1);
                break;
            case 2:
                //gameMode_2.init();
                break;
            case 3:
                //gameMode_3.init();
                break;
            default : gameMode_1.init();
        }
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