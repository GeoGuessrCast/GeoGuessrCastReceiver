/**
 * Created by Stefan on 12.12.2014.
 */
    console.debug("Timer");

    //do some things
    console.log("BBBLLLAAAAAA");
    setTimeout(continueExecution, 10000) //wait ten seconds before continuing
    console.log("BLASDAADSASFASFSASFASF");


function continueExecution()
{
    console.debug("Weiter");

    postMessage(null);
    console.debug("Weiter2");

}