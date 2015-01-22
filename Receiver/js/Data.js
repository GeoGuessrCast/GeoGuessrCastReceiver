// EXAMPLE / UNDER CONSTRUCTION
// evtl einen  data = {...}  um diese ganzen daten, dann hat man auto-vervollständigung auf "data."

data = {

    // ======== global constants ========
    constants : {
        midScreenMessageFadeInTimeMs: 600,
        midScreenMessageFadeOutTimeMs: 800,
        maxDistanceErrorKm: 1000,
        numberOfChoices: 5,
        maxPointsPerAnswer: 10,
        maxNameLength: 15,
        maxAnswerLength: 25
    },

    geoObjType : {   //example: dataManager.getGeoObj(geoObjType.city, getRandomCountryCode(), 5)
        city: 0,
        river: 1,
        country : 2
    },

    channelName : {  //example:   eventManager.broadcast(channelName.admin, jsonObj)
        admin: 0,
        user: 1,
        game: 2
    },

    gameState : {
        guessing: 0,
        evaluating: 1,
        ended: 2
    },

    eventType : {
        createOrUpdateUser: 'createUser',
        submitAnswer: 'gameRound_answerChosen',
        gameEnded: 'game_ended',
        hideConsole: 'hideConsole',
        setGameMode: 'setGameMode',
        setGameProfile: 'setGameProfile',
        restart: 'restart',
        startGame: 'startGame',
        isAdmin: 'isAdmin'

    },


    gameMode : [
        {
            gameModeName: 'City Guessing',
            id: 0,
            geoObjType: 0,
            iconUrl: 'images/city.png'
        },
        {
            gameModeName: 'River Guessing',
            id: 1,
            geoObjType: 1,
            iconUrl: 'images/user.png'   //TODO find img
        },
        {
            gameModeName: 'Country Guessing',
            id: 2,
            geoObjType: 2,
            iconUrl: 'images/user.png'   //TODO find img
        },
        {
            gameModeName: 'Stuff Guessing',
            id: 3,
            geoObjType: 0, //TODO ??
            iconUrl: 'images/user.png'   //TODO find img
        }
    ],


    gameModeProfile : [
        {
            profileName: 'Free Choice',
            id: 0,
            limitedCountry: null,
            multipleChoiceMode: false,
            minPopulationDefault: 500000,
            timePerRoundSec: 30,
            mapOption: {
                mapType : google.maps.MapTypeId.HYBRID,
                borders: true,
                showCountryNames: true
            }
        },
        {
            profileName: 'Multiple Choice',
            id: 1,
            limitedCountry: null,
            multipleChoiceMode: true,
            minPopulationDefault: 200000,
            timePerRoundSec: 15,
            mapOption: {
                mapType : google.maps.MapTypeId.HYBRID,
                borders: true,
                showCountryNames: true
            }
        },
        {
            profileName: 'Multiple Choice (GER)',
            id: 2,
            limitedCountry: 'DE',
            multipleChoiceMode: true,
            minPopulationDefault: 100000,
            timePerRoundSec: 15,
            mapOption: {
                mapType : google.maps.MapTypeId.HYBRID,
                borders: true,
                showCountryNames: false
            }
        },
        {
            profileName: 'Hardcore',
            id: 3,
            limitedCountry: null,
            multipleChoiceMode: false,
            minPopulationDefault: 250000,
            timePerRoundSec: 45,
            mapOption: {
                mapType : google.maps.MapTypeId.SATELLITE,
                borders: false,
                showCountryNames: false
            }
        }
    ]


};
