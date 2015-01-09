var time = 30000, monitor = 100;

function count(){

    time = time -100;
    if(time % 3 === 0) {
        postMessage(time/300);
    }
    //console.log('tick: ' + time);
    if(time > 0){
        setTimeout(function(){count();},100);
    }
}

count();