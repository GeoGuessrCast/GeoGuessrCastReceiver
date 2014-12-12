(function(castReceiver){

    castReceiver.init = function(){
        console.log('running mainMenu.init');

        loadDefaultMap();

        $('#gameOverlay').load('templates/MainMenu.html', function (data) {
            $(this).html(data);
        });

        userManager.rebuildUserList();
        console.log('mainMenu initialized');
    }

}(this.mainMenu = this.mainMenu || {}));
