(function(receiver){

    //private variables and methods
    var privVar = '...';
    function privateMethod(){
        alert('private');
    }

    //expose a function
    receiver.myFunc = function(){
        //alert('funfunfun');
    };

}(this.gameModeManager = this.gameModeManager || {}));
