(function(castReceiver){

    var selectedGameMode;



    // ============ INIT ============

    if(!_isExecutedOnChromeCast()){
        renderManager.hideConsole(false);
        renderManager.hideConsoleOutput(false);
    }
    try {
        var userMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.userChannel', cast.receiver.CastMessageBus.MessageType.JSON);
        var adminMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.adminChannel', cast.receiver.CastMessageBus.MessageType.JSON);
        var gameMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.gameChannel', cast.receiver.CastMessageBus.MessageType.JSON);
        _getUserMessageBus().onMessage = function(event) {
            console.debug('onUserMessage -> ' + JSON.stringify(event.data));
            eventManager.event_onUserMessage(event);
        };
        _getAdminMessageBus().onMessage = function(event) {
            console.debug('onAdminMessage -> ' + JSON.stringify(event.data));
            eventManager.event_onAdminMessage(event);
        };
        _getGameMessageBus().onMessage = function(event) {
            console.debug('onGameMessage -> ' + JSON.stringify(event.data));
            eventManager.event_onGameMessage(event);
        };
    } catch(ex){
        if(_isExecutedOnChromeCast()){
            console.error(ex);
        }
    }




    // ============ GLOBAL EVENTS ============
    castReceiver.event_onReady = function(event) {
        renderManager.loadMainMenu();
    };

    castReceiver.event_onSenderConnected = function(event){
    };

    castReceiver.event_onSenderDisconnected = function(event){
        userManager.removeUser(event.senderId);
        if (userManager.getNumberOfUsers() == 0) {
            window.close();
        }
    };



    // ============ CHANNEL EVENTS ============

    /**
     * on message on user message bus
     * @param event
     */
    castReceiver.event_onUserMessage = function(event){
        var eventData = event.data;

        if(eventData.event_type === data.eventType.createOrUpdateUser) {
            userManager.createOrUpdateUser(event);
        }

        if(eventData.event_type === data.eventType.submitAnswer) {
            gameRoundManager.choseAnswer(event.data.userMac, event.data.answer);
        }

        if(eventData.event_type === data.eventType.requestHighScoreList) {
            var jsondData = {event_type: 'returnHighScoreList', highScoreList: dataManager.getHighScoreList(data.constants.userMaxScoreTresholdForHighScoreList), localHighScoreList: dataManager.createHighScoreListFromCurentUsers(data.constants.userMaxScoreTresholdForHighScoreList)};
            eventManager.send(event.senderId, data.channelName.user, jsondData);
        }
    };
    /**
     * on message on admin message bus
     * @param event
     */
    castReceiver.event_onAdminMessage = function(event){
        var eventData = event.data;

        if(eventData.event_type === data.eventType.setGameMode){
            renderManager.loadGameProfileMenu(eventData.gameMode);
        }

        if(eventData.event_type === data.eventType.setGameProfile){
            if (eventData.gameProfile.id == 3){
                gameModeManager.setGameModeProfile(eventData.gameProfile);
                gameModeManager.startGame(0, eventData.gameProfile.limitedCountry || null);
            } else {
                renderManager.loadHardnessMenu(eventData.gameProfile);
            }
        }

        //TODO event:   gameModeManager.startGame(hardness, countryCode)   (harness = [-1...1])
        if(eventData.event_type === data.eventType.setHardness){
            gameModeManager.startGame(eventData.hardness, eventData.countryCode);
        }

        if(eventData.event_type === data.eventType.hideConsole){
            renderManager.hideConsole(eventData.hide);
        }

        if(eventData.event_type === data.eventType.restart){
            eventManager.restart();
        }

        if(eventData.event_type === data.eventType.loadHighScore){
            renderManager.loadGlobalHighScoreList();
        }

        if(eventData.event_type === data.eventType.loadMainMenu){
            renderManager.loadMainMenu();
        }

    };
    
    /**
     * on message on game message bus
     * @param event
     */
    castReceiver.event_onGameMessage = function(event){

    };

    castReceiver.event_onSystemVolumeChanged = function(event){
    };

    castReceiver.restart = function() {
        var jsonData = {"event_type":data.eventType.restart};
        eventManager.broadcast(data.channelName.admin,jsonData );
        window.location.reload(true);
    };






    /**
     * broadcasts to all connected sender
     * @param {number} channel
     * @param {Object} data
     * @returns {boolean}
     */
    castReceiver.broadcast = function(channel, data) {
        if(!_isExecutedOnChromeCast()){
            return false;
        }
        switch(channel){
            case 0:
                _getAdminMessageBus().broadcast(data);
                break;
            case 1:
                _getUserMessageBus().broadcast(data);
                break;
            case 2:
                _getGameMessageBus().broadcast(data);
                break;
            default: return false;
        }
        return true;
    };

    /**
     * sends a message to a given sender
     * @param {string} senderId
     * @param {number} channel
     * @param {Object} data
     * @returns {boolean}
     */
    castReceiver.send = function(senderId, channel, data) {
        if(!_isExecutedOnChromeCast()){
            return false;
        }

        switch(channel){
            case 0:
                _getAdminMessageBus().send(senderId, data);
                break;
            case 1:
                _getUserMessageBus().send(senderId, data);
                break;
            case 2:
                _getGameMessageBus().send(senderId, data);
                break;
            default: return false;
        }

        return true;
    };









    /**
     * returns user message bus
     * @returns {cast.receiver.CastMessageBus}
     * @private
     */
    function _getUserMessageBus(){
        return userMessageBus;
    }

    /**
     * returns admin message bus
     * @returns {cast.receiver.CastMessageBus}
     * @private
     */
    function _getAdminMessageBus(){
        return adminMessageBus;
    }

    /**
     * returns game message bus
     * @returns {cast.receiver.CastMessageBus}
     * @private
     */
    function _getGameMessageBus(){
        return gameMessageBus;
    }

    /**
     * returns true if application is executed on Chrome Cast, false otherwise
     * @returns {boolean}
     * @private
     */
    function _isExecutedOnChromeCast(){
        var userAgent = navigator.userAgent;
        return userAgent.indexOf('CrKey') > -1;
    }


}(this.eventManager = this.eventManager || {}));
