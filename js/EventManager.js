(function(receiver){

    //private variables and methods
    var privVar = '...';
    function privateMethod(){
        alert('private');
    }

    //expose a function
    receiver.myFunc = function(){
        alert('exposed function');
    };

}(this.eventManager = this.eventManager || {}));
