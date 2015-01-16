// EXAMPLE / UNDER CONSTRUCTION
// evtl einen  data = {...}  um diese ganzen daten, dann hat man auto-vervollständigung auf "data."

data = {

    // ======== global constants ========
    constants : {
        midScreenMessageFadeInTimeMs: 600,
        midScreenMessageFadeOutTimeMs: 1500,
        maxDistanceErrorKm: 1000,
        numberOfChoices: 5
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
        initialized: 0,
        running: 1,
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
        startGame: 'startGame'

    },


    gameMode : {
        gm1 : {
            gameModeName: 'City Guessing',
            id: 1,
            geoObjType: 0,
            iconUrl: '../images/city.png'
        },
        gm2 : {
            gameModeName: 'River Guessing',
            id: 2,
            geoObjType: 1,
            iconUrl: '../images/user.png'   //TODO find img
        },
        gm3 : {
            gameModeName: 'Country Guessing',
            id: 3,
            geoObjType: 2,
            iconUrl: '../images/user.png'   //TODO find img
        },
        gm4 : {
            gameModeName: 'Stuff Guessing',
            id: 4,
            geoObjType: 0, //TODO ??
            iconUrl: '../images/user.png'   //TODO find img
        }
    },


    gameModeProfile : {
        p1 : {
            profileName: 'Free Choice',
            id: 1,
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
        p2 : {
            profileName: 'Multiple Choice',
            id: 2,
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
        p3 : {
            profileName: 'Multiple Choice (GER)',
            id: 3,
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
        p4 : {
            profileName: 'Hardcore',
            id: 4,
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
    }


};
