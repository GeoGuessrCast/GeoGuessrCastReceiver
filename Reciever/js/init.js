/**
 * Created by Stefan on 28.11.2014.
 */

var map;
function initialize() {
alert('init');
    map = window.map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
        zoom: 3,
        mapTypeControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    $.getScript( "js/EventManager.js" );
    $.getScript( "js/DataManager.js" );
    $.getScript( "js/UserManager.js" );
    $.getScript( "js/gamemodes/GameMode_1.js" );
    $.getScript( "js/GameModeManager.js" );
}