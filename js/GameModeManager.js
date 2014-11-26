(function(castReceiver){

    //private variables and methods
    var privVar = '...';
    function privateMethod(){
        alert('private');
    }

    //expose a function
    castReceiver.myFunc = function(){
        //alert('funfunfun');
    };

}(this.gameModeManager = this.gameModeManager || {}));
