(function(rm){

    rm.loadDefaultMap = function() {
        window.map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
            zoom: 3,
            mapTypeControl: true,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        });
    };

    rm.loadMainMenu = function(){
        gameRoundManager.cancelRoundTimer();
        renderManager.loadDefaultMap();

        $('#gameOverlay').load('templates/MainMenu.html', function (data) {
            $(this).html(data);
        });

        userManager.rebuildUserList();
    };

    rm.loadGameProfileMenu = function(){
        gameRoundManager.cancelRoundTimer();
        $('#gameOverlay').load('templates/GameProfileMenu.html', function (data) {
            $(this).html(data);

            $('#profile_1').text(gameModeManager.p1.profileName);
            $('#profile_1').attr('onclick', "gameModeManager.startGame(gameModeManager.gm1, gameModeManager.p1)");

            $('#profile_2').html('test');
            $('#profile_3').html('test');
            $('#profile_4').html('test');

            userManager.rebuildUserList();
        });
    };


    rm.showMidScreenMessage = function(message){
        $('#midScreenMessage').hide();
        $('#midScreenMessage').html(message);
        $('#midScreenMessage').fadeIn(data.constants.midScreenMessageFadeInTimeMs, function () {
            renderManager.clearMidScreenMessage();
        });
    };

    rm.setMidScreenMessage = function(message){
        $('#midScreenMessage').hide();
        $('#midScreenMessage').html(message);
        $('#midScreenMessage').fadeIn(data.constants.midScreenMessageFadeInTimeMs);
    };

    rm.clearMidScreenMessage = function(){
        $('#midScreenMessage').fadeOut(data.constants.midScreenMessageFadeOutTimeMs, function () {
            $(this).empty();
        });
    };


    rm.hideConsole = function(hide) {
        if (hide) {
            $('#testConsole').hide();
        } else {
            $('#testConsole').show();
        }
    };


}(this.renderManager = this.renderManager || {}));
