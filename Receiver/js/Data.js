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
        maxAnswerLength: 25,
        userMaxScoreTresholdForHighScoreList: 40
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
        isAdmin: 'isAdmin',
        loadHighScore: 'loadHighScore',
        loadMainMenu: 'loadMainMenu',
        requestHighScoreList: 'requestHighScoreList'

    },


    gameMode : [
        {
            gameModeName: 'City Guessing',
            id: 0,
            geoObjType: 0,
            iconCssClass: 'cityIcon'
        },
        {
            gameModeName: 'River Guessing',
            id: 1,
            geoObjType: 1,
            iconCssClass: 'riverIcon'
        },
        {
            gameModeName: 'Country Guessing',
            id: 2,
            geoObjType: 2,
            iconCssClass: 'countryIcon'
        }
    ],


    gameModeProfile : [
        {
            profileName: 'Free Choice',
            id: 0,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 4000000,
            minPopulationDefault: 500000,
            scoreWeightFactor: 1.3,
            timePerRoundSec: 30,
            mapOption: {
                mapType : google.maps.MapTypeId.ROADMAP, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                }
            }
        },
        {
            profileName: 'Multiple Choice',
            id: 1,
            limitedCountry: null,
            multipleChoiceMode: true,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 2000000,
            minPopulationDefault: 200000,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 15,
            mapOption: {
                mapType : google.maps.MapTypeId.HYBRID, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                }
            }
        },
        {
            profileName: 'Germany Only (MC)',
            id: 2,
            limitedCountry: 'DE',
            multipleChoiceMode: true,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 4000000,
            minPopulationDefault: 100000,
            scoreWeightFactor: 0.7,
            timePerRoundSec: 15,
            mapOption: {
                mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                }
            }
        },
        {
            profileName: 'Location Pointing',
            id: 3,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: true,
            minTotalCities: 10,
            minCountryPopulation: 4000000,
            minPopulationDefault: 250000,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 23,
            mapOption: {
                mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                }
            }
        },
        {
            profileName: 'Hardcore (FC)',
            id: 4,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: false,
            minTotalCities: 1,
            minCountryPopulation: 100000,
            minPopulationDefault: 250000,
            scoreWeightFactor: 1.8,
            timePerRoundSec: 36,
            mapOption: {
                mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: false,
                showCityNames: false,
                showRiverNames: false,
                showCountryNames: false,
                renderOptions: {
                    globalHue: '#ff2b00',
                    globalGamma: 0.2,
                    globalSaturation: -99,
                    waterColor: '#250d0d',
                    borderColor: '#ffffff',
                    borderWeight: 0.4
                }
            }
        }
    ]


};
