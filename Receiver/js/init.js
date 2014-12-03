

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

    // handler for the 'ready' event
    castReceiverManager.onReady = function(event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");

        eventManager.event_onReady(event);
    };

    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function(event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);

        eventManager.event_onSenderConnected(event);
    };

    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function(event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }

        eventManager.event_onSenderDisconnected(event);
    };

    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function(event) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
        event.data['muted']);

        eventManager.event_onSystemVolumeChanged(event);
    };

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.sample.helloworld');
    window.adminMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.sample.adminChannel', cast.receiver.CastMessageBus.MessageType.JSON);

    // handler for the messageBus message event
    window.messageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
        displayText(event.data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        eventManager.event_onMessage(event);

        // WOZU IST DAS ?
        //TODO clean up code !!!
        window.messageBus.send(event.senderId, event.data);
    };

    // handler for the adminMessageBus message event
    window.adminMessageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
        displayText(JSON.stringify(event.data));
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.adminMessageBus.send(event.senderId, event.data);
    };

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');


}