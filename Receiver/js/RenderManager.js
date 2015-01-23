(function(rm){

    var currentTimerPosition = 0;
    var numberSteps = 20;
    var percentPerStep = 5;
    var diffusePartPercet = 3;
    rm.consoleOutPutHidden = false;



    rm.playTimerAnimationWithRoundDisplay = function(animationDurationSec, currentRound, maxRounds) {
        currentTimerPosition = 0;
        renderManager.incTimerBy();
        $('#roundDisplayAndTimer')
            .show()
            .html('Round ' + currentRound + '/' + maxRounds);

        var aniMs = parseInt(animationDurationSec)*1000;
        /*
         30 s
         30000 ms
         schrittlaenge 100? 5er Schritte
         */
        return executionManager.execPeriodically(aniMs/numberSteps, numberSteps, renderManager.incTimerBy ,null );
        //return executionManager.execDelayed(aniMs, renderManager.incTimerBy ); ....no crash with this
    };

    rm.incTimerBy = function() {
        var counter = (currentTimerPosition + percentPerStep);
        var counter2=parseInt(counter)+diffusePartPercet;
        currentTimerPosition = parseInt(currentTimerPosition) + parseInt(percentPerStep);
        $('#roundDisplayAndTimer').css('background',
            'linear-gradient(to right, rgba(222, 45, 45, 0.90) '+counter+'%, rgba(87, 87, 87, 0.70) '+counter2+'%, rgba(218, 218, 218, 0.70))');
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

        $('#gm1')
            .text(data.gameMode[0].gameModeName)
            .attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[0]);");

        $('#gm2')
            .text(data.gameMode[1].gameModeName)
            .attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[1]);");

        $('#gm3')
            .text(data.gameMode[2].gameModeName)
            .attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[2]);");

        $('#gm4')
            .text(data.gameMode[3].gameModeName)
            .attr('onclick', "renderManager.loadGameProfileMenu(data.gameMode[3]);");

        renderManager.rebuildUserList();
    };

    rm.loadGameProfileMenu = function(selectedGameModeObject){
        gameModeManager.setGameMode(selectedGameModeObject);
        gameRoundManager.cancelRoundTimer();

        $('#gameOverlay').load('templates/GameProfileMenu.html', function (content) {
            $(this).html(content);

            $('#profile_1')
                .text(data.gameModeProfile[0].profileName)
                .attr('onclick', "gameModeManager.startGame(data.gameModeProfile[0]);");

            $('#profile_2')
                .text(data.gameModeProfile[1].profileName)
                .attr('onclick', "gameModeManager.startGame(data.gameModeProfile[1]);");

            $('#profile_3')
                .text(data.gameModeProfile[2].profileName)
                .attr('onclick', "gameModeManager.startGame(data.gameModeProfile[2]);");

            $('#profile_4')
                .text(data.gameModeProfile[3].profileName)
                .attr('onclick', "gameModeManager.startGame(data.gameModeProfile[3]);");

            renderManager.rebuildUserList();
        });
    };


    /**
     * rebuilds/updates #mainMenuUserList
     */
    rm.rebuildUserList = function() {
        var userCssClass;
        var userList = userManager.getUserList();
        var userLength = userList.length;
        var mainMenuUserList = $('#mainMenuUserList');
        mainMenuUserList.find('ul').html('');
        for(var i = 0; i < userLength; i++){
            if (userList[i].admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            //$('#mainMenuUserList').find('ul').append('<li style="color:' + userList[i].color + '" class="' + userCssClass + '" id="'+userList[i].mac+'">'+userList[i].name+'</li>');
            mainMenuUserList.find('ul').append('<li class="noLinebreak ' + userCssClass + '" id="'+userList[i].mac+'">'+userList[i].name+'</li>');
        }
    };


    rm.refreshBottomScoreboard = function() {
        var userCssClass;
        var userList = userManager.getUserList();
        var bottomScoreboard = $('#bottomScoreboard');
        var isGuessingState = (gameRoundManager.currentGameState == data.gameState.guessing);

        bottomScoreboard.html('');

        for(var i = 0; i < userList.length; i++){
            var iconCssClass = 'noIcon';
            var color = 'rgb(180,180,180)';
            var user = userList[i];
            if (user.admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            var userAnswerCity;
            var userAnswer = user.lastAnswerGiven;
            if (isGuessingState) {
                if (userAnswer == null) {
                    iconCssClass = 'waitingIcon'; //TODO
                } else {
                    iconCssClass = 'readyIcon';
                }
                userAnswerCity = '&nbsp&nbsp&nbsp&nbsp';
            } else {
                if (userAnswer == null) {
                    userAnswerCity = '(no answer)';
                } else {
                    userAnswerCity = userAnswer.guessedName;
                    var answerWorthFact = userAnswer.points/data.constants.maxPointsPerAnswer; // 0=worst answer, 1=best
                    var red = Math.floor((1-answerWorthFact)*160);
                    var green = Math.floor(answerWorthFact*160);
                    color = 'rgb(' + red + ',' + green + ',0)';
                }
            }

            bottomScoreboard
                .append('<span><div><span class="userStates" id="userState_' + user.senderId + '">' + userAnswerCity + '</span></div><span class="'
                + userCssClass + ' noLinebreak userName">' + user.name + ': </span><span class="score">' + user.pointsInCurrentGame
                + '</span></span>');

            var userStateDiv = $('#userState_'+user.senderId);

            userStateDiv.css('color', color);
            userStateDiv.removeClass('waitingIcon');
            userStateDiv.removeClass('readyIcon');
            userStateDiv.removeClass('noIcon');
            userStateDiv.addClass(iconCssClass);
        }
    };


    rm.showMidScreenMessage = function(message, holdTimeSec){
        $('#midScreenMessage')
            .hide()
            .html(message)
            .fadeIn(data.constants.midScreenMessageFadeInTimeMs, function () {
            executionManager.execDelayed(holdTimeSec*1000,renderManager.clearMidScreenMessage);
        });
    };

    rm.setMidScreenMessage = function(message){
        $('#midScreenMessage')
            .hide()
            .html(message)
            .fadeIn(data.constants.midScreenMessageFadeInTimeMs);
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
            renderManager.consoleOutPutHidden = true;
            $('#testConsoleOutput').hide();
        } else {
            renderManager.consoleOutPutHidden = false;
            $('#testConsoleOutput').show();
        }
    };

    rm.toggleConsoleOutput = function() {
        renderManager.consoleOutPutHidden = !renderManager.consoleOutPutHidden;
        renderManager.hideConsoleOutput(renderManager.consoleOutPutHidden);
    };


}(this.renderManager = this.renderManager || {}));
