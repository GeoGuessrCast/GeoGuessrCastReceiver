var delay = 0,
    intervalDelay = 0,
    repeat = 0;

function delayTimer(){
    // wait for start signal with parameter
    onmessage = function (e) {
        var data = e.data;
        delay = intervalDelay = data.delay;
        repeat = data.repeat;

        start();
    };
}

function start(){
    if(delay > 0 && repeat > 0) {
        count();
    }
}

function count(){
    delay = delay - 100;
    if(delay >= 0) {
        setTimeout(function(){count();},100);
    } else {
        repeat = --repeat;
        delay = intervalDelay;
        postMessage({'tick' : repeat});

        if(repeat >= 0) {
            start();
        }
    }
}

delayTimer();

