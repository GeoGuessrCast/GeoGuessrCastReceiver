(function(castReceiver){

    castReceiver.init = function(){
        console.log('running gameProfileMenu.init');
        $('#gameOverlay').load('templates/GameProfileMenu.html', function (data) {
            $(this).html(data);
        });

        console.log('gameProfileMenu initialized');
    }

}(this.gameProfileMenu = this.gameProfileMenu || {}));
