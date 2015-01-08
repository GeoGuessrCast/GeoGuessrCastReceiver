(function(castReceiver){

    // init
    /** @type cast.receiver.CastMessageBus */
    var userMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.userChannel', cast.receiver.CastMessageBus.MessageType.JSON);
    /** @type cast.receiver.CastMessageBus */
    var adminMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.adminChannel', cast.receiver.CastMessageBus.MessageType.JSON);
    /** @type cast.receiver.CastMessageBus */
    var gameMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.gameChannel', cast.receiver.CastMessageBus.MessageType.JSON);

    _getUserMessageBus().onMessage = function(event) {
        console.log('userMessageBus [' + event.senderId + ']: ' + event.data);
        eventManager.event_onUserMessage(event);
    };

    _getAdminMessageBus().onMessage = function(event) {
        console.log('adminMessageBus [' + event.senderId + ']: ' + event.data);
        eventManager.event_onAdminMessage(event);
    };

    _getGameMessageBus().onMessage = function(event) {
        console.log('gameMessageBus [' + event.senderId + ']: ' + event.data);
        eventManager.event_onGameMessage(event);
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

    castReceiver.event_onReady = function(event) {
        displayEvent('onReady', event);
        mainMenu.init();

    };

    castReceiver.event_onSenderConnected = function(event){
        displayEvent('onSenderConnected', event);

    };

    castReceiver.event_onSenderDisconnected = function(event){
        displayEvent('onSenderDisconnected', event);

        userManager.removeUser(event.data.userMac);

        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }

    };

    /**
     * on message on user message bus
     * @param event
     */
    castReceiver.event_onUserMessage = function(event){
        displayEvent('onUserMessage', event);
        var eventData = event.data;

        /*
        switch (eventData.event_type) {
            case 'createUser':

        }*/

        if(eventData.event_type === 'createUser') {
            var hasUser = userManager.hasUserMac(event.data.userMac);
            if (!hasUser) {
                //add new User
                var isAdmin = false;
                if (userManager.getUserList().length === 0) {
                    isAdmin = true;
                }
                var user = new userManager.User(event.senderId, event.data.userName, event.data.userMac, isAdmin);
                userManager.addUser(user);
            } else {
                // update name and senderId
                userManager.updateUser(event.data.userMac, event.data.userName, event.senderId);
            }
            //inform the Sender if the user is game leader
            //window.userMessageBus.send(event.senderId, userManager.isUserAdmin(event.senderId));
            eventManager.send(event.senderId, data.channelName.user, userManager.isUserAdmin(event.data.userMac));
        }

        // update View or sth...
        if(eventData.event_type === 'gameRound_answerChosen') {
            gameRoundManager.choseAnswer(event.data.userMac, event.data.answer);
        }
    };
    /**
     * on message on admin message bus
     * @param event
     */
    castReceiver.event_onAdminMessage = function(event){
        displayEvent('onAdminMessage', event);
        var eventData = event.data;

        if(eventData.event_type === 'setGameMode'){
            //gameModeManager.setGameMode(eventData.gameMode);
            gameModeManager.startGame(eventData.gameMode, eventData.profile);
        }

        if(eventData.event_type === 'setGameRoundEnded'){
            displayText('got setGameRoundEnded, ignoring it.');
            //gameModeManager.setGameRoundEnded(eventData.gameMode);
        }
    };
    
    /**
     * on message on game message bus
     * @param event
     */
    castReceiver.event_onGameMessage = function(event){
        displayEvent('onGameMessage', event);

        // aktueller game mode?
        // aktuelle runde?
        // was koennen fuer msg kommen?
        // next round
        // game started
        // game ended

    };

    castReceiver.event_onSystemVolumeChanged = function(event){
    };

}(this.eventManager = this.eventManager || {}));
