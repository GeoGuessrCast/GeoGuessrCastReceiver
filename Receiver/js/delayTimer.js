var delay = 0;
function delayTimer(){
    // wait for start signal with parameter
    onmessage = function (e) {
        var data = e.data;
        delay = parseInt(data.delay);

        if(delay > 0) {
            count();
        }
    };
}

function count(){
    delay = delay - 100;
    if(delay >= 0) {
        setTimeout(function(){count();},100);
    } else {
        postMessage({'success' : true});
    }
}

delayTimer();

