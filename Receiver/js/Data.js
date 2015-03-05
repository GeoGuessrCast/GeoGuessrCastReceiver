// EXAMPLE / UNDER CONSTRUCTION
// evtl einen  data = {...}  um diese ganzen daten, dann hat man auto-vervollständigung auf "data."

data = {

    // ======== global constants ========
    constants : {
        midScreenMessageFadeInTimeMs: 600,
        midScreenMessageFadeOutTimeMs: 800,
        maxDistanceErrorKmDefault: 1000,
        numberOfChoices: 5,
        maxPointsPerAnswer: 10, // use gameRoundManager.getMaxPointsPerAnswer() !
        maxNameLength: 25,
        maxAnswerLength: 25,
        userMaxScoreTresholdForHighScoreList: 35
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
            gameModeName: 'Country Guessing',
            id: 1,
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
            minCountryPopulation: 10111000,
            minPopulationDefault: 600111,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 30,
            mapOption: {
                mapType : google.maps.MapTypeId.ROADMAP, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                    globalGamma: 0.43
                }
            }
        },
        {
            profileName: 'Easy (FC)',
            id: 1,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 50111000, //germany = 58748310
            minPopulationDefault: 1600111,
            scoreWeightFactor: 0.7,
            timePerRoundSec: 30,
            mapOption: {
                mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: true,
                showRiverNames: true,
                showCountryNames: true,
                renderOptions: {
                    globalGamma: 0.28,
                    globalSaturation: -35,
                    waterColor: '#7389AB'
                }
            }
        },
        {
            profileName: 'Hardcore (FC)',
            id: 2,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: false,
            minTotalCities: 1,
            minCountryPopulation: 5111000,
            minPopulationDefault: 350111,
            scoreWeightFactor: 1.8,
            timePerRoundSec: 30,
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
        },
        {
            profileName: 'Multiple Choice',
            id: 3,
            limitedCountry: null,
            multipleChoiceMode: true,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 10111000,
            minPopulationDefault: 900111,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 18,
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
            id: 4,
            limitedCountry: 'DE',
            multipleChoiceMode: true,
            pointingMode: false,
            minTotalCities: 10,
            minCountryPopulation: 0,
            minPopulationDefault: 700000, // applyHardnessFact DE=0.5 !
            scoreWeightFactor: 0.7,
            timePerRoundSec: 18,
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
            profileName: 'Pointing Mode',
            id: 5,
            limitedCountry: 'DE',
            multipleChoiceMode: false,
            pointingMode: true,
            minTotalCities: 1,
            minCountryPopulation: 8111000,
            minPopulationDefault: 700111,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 20,
            mapOption: {
                mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || HYBRID || TERRAIN
                borders: true,
                roads: true,
                showCityNames: false,
                showRiverNames: false,
                showCountryNames: true,
                renderOptions: {
                }
            }
        },
        {
            profileName: 'Custom ...',
            id: 6,
            limitedCountry: null,
            multipleChoiceMode: false,
            pointingMode: false,
            minTotalCities: 1,
            minCountryPopulation: 5111000,
            minPopulationDefault: 350111,
            scoreWeightFactor: 1.0,
            timePerRoundSec: 30,
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
