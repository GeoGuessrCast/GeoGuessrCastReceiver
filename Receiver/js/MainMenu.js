(function(castReceiver){

    castReceiver.init = function(){
        console.log('running mainMenu.init');
        $('#gameOverlay').load('templates/MainMenu.html', function (data) {
            $(this).html(data);
        });

        console.log('mainMenu initialized');
    }


}(this.mainMenu = this.mainMenu || {}));
