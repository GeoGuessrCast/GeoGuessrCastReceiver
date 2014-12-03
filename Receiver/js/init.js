

var map;
function initialize() {
    map = window.map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
        zoom: 3,
        mapTypeControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    $.getScript( "js/EventManager.js" );
    $.getScript( "js/DataManager.js" );
    $.getScript( "js/UserManager.js" );
    $.getScript( "js/gamemodes/GameMode_1.js" );
    $.getScript( "js/GameModeManager.js" );

    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
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
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
        eventManager.event_onSenderDisconnected(event);
    };


    window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.sample.helloworld');
    window.adminMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.sample.adminChannel', cast.receiver.CastMessageBus.MessageType.JSON);

    window.messageBus.onMessage = function(event) {
        console.log('messageBus [' + event.senderId + ']: ' + event.data);
        eventManager.event_onMessage(event);
    };

    window.adminMessageBus.onMessage = function(event) {
        console.log('adminMessageBus [' + event.senderId + ']: ' + event.data);
        eventManager.event_onAdminMessage(event);
    };

    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');


}