(function(rm){


    //TODO include MainMenu.js etc (templateLoader) here


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



}(this.renderManager = this.renderManager || {}));
