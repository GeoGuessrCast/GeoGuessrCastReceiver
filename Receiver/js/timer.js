
//do some things


console.log("calling timer.js");
setTimeout(continueExecution, 30000)  //TODO implement round time as parameter AND post 1 second messages for a visualisation
console.log("timer.js: passed setTimeout line");

function continueExecution()
{
    console.log("timer.js: continueExecution()");
    postMessage(null);
    console.log("timer.js: continueExecution() ends");

}