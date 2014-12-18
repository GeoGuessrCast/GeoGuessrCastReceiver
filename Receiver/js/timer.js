
//do some things
console.log("calling timer.js");
setTimeout(continueExecution, 10000) //wait ten seconds before continuing
console.log("timer.js: passed setTimeout line");

function continueExecution()
{
    console.log("timer.js: continueExecution()");
    postMessage(null);
    console.log("timer.js: continueExecution() ends");

}