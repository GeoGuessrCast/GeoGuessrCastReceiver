(function(castReceiver){

    castReceiver.event_onReady = function(event) {
        //TODO testing...
        gameMode_1.init();

    };

    castReceiver.event_onSenderConnected = function(event){
        // get sender
        // TODO fm: check for id already in storage?
        var firstUser = false;
        if(userManager.getUserList().length === 0) {
            firstUser = true;
        }

        var id = window.castReceiverManager.getSender(event.data).id;
        var user = new userManager.User(id, 'Sender-'+id, firstUser);
        userManager.addUser(user);

    };

    castReceiver.event_onSenderDisconnected = function(event){

    };

    castReceiver.event_onMessage = function(event){
        displayText(event.data);
    };

    castReceiver.event_onAdminMessage = function(event){
        displayJson(event.data);
    };

    castReceiver.event_onSystemVolumeChanged = function(event){

    };

}(this.eventManager = this.eventManager || {}));
