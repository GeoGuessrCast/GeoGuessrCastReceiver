(function(castReceiver){


    //private variables and methods
    var privVar = '...';
    function privateMethod(){
        alert('private');
    }

    //expose a function
    castReceiver.myFunc = function(){
        alert('exposed function');
    };

    castReceiver.event_onReady = function(event) {

    };

    castReceiver.event_onSenderConnected = function(event){

    };

    castReceiver.event_onSenderDisconnected = function(event){

    };

    castReceiver.event_onMessage = function(event){

    };

    castReceiver.event_onSystemVolumeChanged = function(event){

    };

}(this.eventManager = this.eventManager || {}));
