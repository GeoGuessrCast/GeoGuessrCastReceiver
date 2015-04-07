


function initialize() {

    //adding contains function to arrays
    Array.prototype.contains = function(obj) {
        return this.indexOf(obj) > -1;
    };

    console.log("[Programm]  Copyright (C) 2015  TU Dresden.\n This program comes with ABSOLUTELY NO WARRANTY. \n This is free software, and you are welcome to redistribute it under certain conditions.")
    if (typeof(cast) !== 'undefined') {
        cast.receiver.logger.setLevelValue(1000); //= ERROR
        console.log("[init] ChromeCast mode started");
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    } else {
        print("[init] Local mode started");
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
            console.debug('onSenderConnected -> ' + JSON.stringify(event));
            //console.log(window.castReceiverManager.getSender(event.data).userAgent);
            eventManager.event_onSenderConnected(event);
        };

        castReceiverManager.onSenderDisconnected = function(event) {
            console.debug('onSenderDisconnected -> ' + JSON.stringify(event));
            eventManager.event_onSenderDisconnected(event);
        };
        window.castReceiverManager.start({statusText: "Application is starting"});
    }



    window.map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
        zoom: 3,
        mapTypeControl: false,
        disableDefaultUI: true,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    renderManager.applyGameMenuMapstyle();


}

