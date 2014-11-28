(function(castReceiver){

    castReceiver.event_onReady = function(event) {
        // TODO fm: create initial user ?
    };

    castReceiver.event_onSenderConnected = function(event){
        // get sender
        // TODO fm: check for id already in storage?
        var firstUser = false;
        if(userManager.getUserList().length === 0) {
            firstUser = true;
        }

        var id = window.castReceiverManager.getSender(event.data).id;
        var user = new userManager.User(id, 'Sender1', firstUser);
        userManager.addUser(user);
        // is first user ?

    };

    castReceiver.event_onSenderDisconnected = function(event){

    };

    castReceiver.event_onMessage = function(event){

    };

    castReceiver.event_onSystemVolumeChanged = function(event){

    };

}(this.eventManager = this.eventManager || {}));
