(function(castReceiver){

    castReceiver.init = function(gameModeId){
        console.log('running gameProfileMenu.init');
        $('#gameOverlay').load('templates/GameProfileMenu.html', function (data) {
            $(this).html(data);

            $('#profile_1').text(gameModeManager.p1.profileName);
            $('#profile_1').attr('onclick', "gameModeManager.startGame(gameModeManager.gm1, gameModeManager.p1)");

            $('#profile_2').html('test');
            $('#profile_3').html('test');
            $('#profile_4').html('test');

            userManager.rebuildUserList();
        });
        console.log('gameProfileMenu initialized');
    }

}(this.gameProfileMenu = this.gameProfileMenu || {}));
