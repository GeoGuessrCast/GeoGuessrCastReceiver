


function initialize() {


    if (typeof(cast) !== 'undefined') {
        cast.receiver.logger.setLevelValue(1000); //= ERROR
        console.log("[init] ChromeCast mode started");
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    } else {
        console.log("[init] Local mode started");
    }


    $.ajaxSetup({async:false, cache:true});
    $.getScript( "js/ExecutionManager.js" );
    $.getScript( "js/RenderManager.js" );
    $.getScript( "js/EventManager.js" );
    $.getScript( "js/DataManager.js" );
    $.getScript( "js/UserManager.js" );
    $.getScript( "js/GameModeManager.js" );
    $.getScript( "js/GameRoundManager.js" );


    if (typeof(cast) !== 'undefined') {
        castReceiverManager.onReady = function(event) {
            console.debug('onReady -> ' + JSON.stringify(event.data));
            //window.castReceiverManager.setApplicationState("Application status is ready...");
            eventManager.event_onReady(event);
        };

        castReceiverManager.onSenderConnected = function(event) {
            console.debug('onSenderConnected -> ' + event.data);
            console.log(window.castReceiverManager.getSender(event.data).userAgent);
            eventManager.event_onSenderConnected(event);
        };

        castReceiverManager.onSenderDisconnected = function(event) {
            console.debug('onSenderDisconnected -> ' + event.data);
            eventManager.event_onSenderDisconnected(event);
        };
        window.castReceiverManager.start({statusText: "Application is starting"});
    }


    renderManager.loadDefaultMap();

    //window.userMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.userChannel', cast.receiver.CastMessageBus.MessageType.JSON);
    //window.adminMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.adminChannel', cast.receiver.CastMessageBus.MessageType.JSON);
    //window.gameMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:de.tud.kp.geoguessrcast.gameChannel', cast.receiver.CastMessageBus.MessageType.JSON);

    // create user
    //window.userMessageBus.onMessage = function(event) {
    //    console.log('userMessageBus [' + event.senderId + ']: ' + event.data);
    //    eventManager.event_onUserMessage(event);
    //};
    //
    ////
    //window.adminMessageBus.onMessage = function(event) {
    //    console.log('adminMessageBus [' + event.senderId + ']: ' + event.data);
    //    eventManager.event_onAdminMessage(event);
    //};
    //
    //window.gameMessageBus.onMessage = function(event) {
    //    console.log('gameMessageBus [' + event.senderId + ']: ' + event.data);
    //    eventManager.event_onGameMessage(event);
    //};




    /*
    var worker = new Worker('js/timer.js'); //External script
    worker.onmessage = function(event) {    //Method called by external script
        console.log("init.js: onmessage !");
        eventManager.event_onReady(null);
    };
    console.log("init.js ended")
    */
}

