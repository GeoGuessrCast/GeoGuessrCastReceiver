(function(castReceiver){

    castReceiver.init = function(){
        console.log('running mainMenu.init');

        $('#gameOverlay').html('<div class="header" id="mainHeader">Geo Guessing</div>');

        console.log('mainMenu initialized');
    }


}(this.mainMenu = this.mainMenu || {}));
