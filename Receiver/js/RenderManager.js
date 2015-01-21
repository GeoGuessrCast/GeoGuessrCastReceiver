(function(rm){

    var currentTimerPosition = 0;
    var numberSteps = 20;
    var percentPerStep = 5;
    var diffusePartPercet = 3;
    rm.consoleOutPutHidden = false;



    rm.playTimerAnimationWithRoundDisplay = function(animationDurationSec, currentRound, maxRounds) {
        currentTimerPosition = percentPerStep;
        $('#roundDisplayAndTimer').show();
        $('#roundDisplayAndTimer').css('background',
            'linear-gradient(to right, rgba(222, 45, 45, 0.90) 0%, rgba(87, 87, 87, 0.70) '+diffusePartPercet+'%, rgba(218, 218, 218, 0.70))');
        $('#roundDisplayAndTimer').html('Round ' + currentRound + '/' + maxRounds);

        var aniMs = parseInt(animationDurationSec)*1000;
        /*
         30 s
         30000 ms
         schrittlaenge 100? 5er Schritte
         */

        executionManager.execPeriodically(aniMs/numberSteps, numberSteps, renderManager.incTimerBy ,null );
    };

    rm.incTimerBy = function() {
        var counter = (currentTimerPosition + percentPerStep);
        currentTimerPosition = parseInt(currentTimerPosition) + parseInt(percentPerStep);

        var perc=parseInt(counter);
        var perc2=parseInt(counter)+diffusePartPercet;

        $('#roundDisplayAndTimer').css('background',
            'linear-gradient(to right, rgba(222, 45, 45, 0.90) '+perc+'%, rgba(87, 87, 87, 0.70) '+perc2+'%, rgba(218, 218, 218, 0.70))');
    };

    rm.hideTopRightRoundTimer = function() {
        $('#roundDisplayAndTimer').hide();
    };



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

        $('#gameOverlay').load('templates/MainMenu.html', function (content) {
            $(this).html(content);
        });

        $('#gm1').text(data.gameMode[0].gameModeName);
        $('#gm1').attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[0]);");

        $('#gm2').text(data.gameMode[1].gameModeName);
        $('#gm2').attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[1]);");

        $('#gm3').text(data.gameMode[2].gameModeName);
        $('#gm3').attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[2]);");

        $('#gm4').text(data.gameMode[3].gameModeName);
        $('#gm4').attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[3]);");

        userManager.rebuildUserList();
    };

    rm.loadGameProfileMenu = function(selectedGameModeObject){
        gameModeManager.setGameMode(selectedGameModeObject);
        gameRoundManager.cancelRoundTimer();

        $('#gameOverlay').load('templates/GameProfileMenu.html', function (content) {
            $(this).html(content);

            $('#profile_1').text(data.gameModeProfile[0].profileName);
            $('#profile_1').attr('onclick', "gameModeManager.startGame(data.gameModeProfile[0]);");

            $('#profile_2').text(data.gameModeProfile[1].profileName);
            $('#profile_2').attr('onclick', "gameModeManager.startGame(data.gameModeProfile[1]);");

            $('#profile_3').text(data.gameModeProfile[2].profileName);
            $('#profile_3').attr('onclick', "gameModeManager.startGame(data.gameModeProfile[2]);");

            $('#profile_4').text(data.gameModeProfile[3].profileName);
            $('#profile_4').attr('onclick', "gameModeManager.startGame(data.gameModeProfile[3]);");

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
        renderManager.hideConsoleOutput(hide);
    };

    rm.hideConsoleOutput = function(hide) {
        if (hide) {
            $('#testConsoleOutput').hide();
        } else {
            $('#testConsoleOutput').show();
        }
    };

    rm.toggleConsoleOutput = function() {
        renderManager.hideConsoleOutput(renderManager.consoleOutPutHidden);
        renderManager.consoleOutPutHidden = !renderManager.consoleOutPutHidden;
    };


}(this.renderManager = this.renderManager || {}));
