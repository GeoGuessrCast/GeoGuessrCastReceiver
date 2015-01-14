


function initialize() {


    if (typeof(cast) !== 'undefined') {
        displayText("[ChromeCast mode]");
        cast.receiver.logger.setLevelValue(0);
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    } else {
        displayText("[Local mode]");
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
        console.log('Starting Receiver Manager');
        castReceiverManager.onReady = function(event) {
            console.log('Received Ready event: ' + JSON.stringify(event.data));
            //window.castReceiverManager.setApplicationState("Application status is ready...");
            eventManager.event_onReady(event);
        };

        castReceiverManager.onSenderConnected = function(event) {
            console.log('Received Sender Connected event: ' + event.data);
            console.log(window.castReceiverManager.getSender(event.data).userAgent);
            eventManager.event_onSenderConnected(event);
        };

        castReceiverManager.onSenderDisconnected = function(event) {
            console.log('Received Sender Disconnected event: ' + event.data);
            eventManager.event_onSenderDisconnected(event);
        };
        window.castReceiverManager.start({statusText: "Application is starting"});
        console.log('Receiver Manager started');
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

