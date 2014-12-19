// EXAMPLE / UNDER CONSTRUCTION
// evtl einen  data = {...}  um diese ganzen daten, dann hat man auto-vervollständigung auf "data."


// ======== global constants ========
constants = {
    maxRounds: 5,
    maxDistanceErrorKm: 1000
};

geoObjType = {   //example: dataManager.getGeoObj(geoObjType.city, getRandomCountryCode(), 5)
    city: 'CITY',
    river: 'RIVER',
    country : 'COUNTRY'
};

channelName = {  //example:   eventManager.broadcast(channelName.admin, jsonObj)
    admin: 'ADMIN',
    user: 'USER',
    game: 'GAME'
};

gameState = {
    initialized: 'INITIALIZED',
    running: 'RUNNING',
    ended: 'ENDED'
};

eventType = {
    createOrUpdateUser: 'CREATE_OR_UPDATE_USER',
    submitAwnser: 'SUBMIT_AWNSER'
}


// ======== global vars ========
currentGameState = {
    currentGameId : 1,
    currentRound : 1
};

userList = [];



