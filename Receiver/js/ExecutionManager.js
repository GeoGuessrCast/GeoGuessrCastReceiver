(function(em){


    em.execDelayed = function(delayMs, callbackFunc){
        //TODO use worker thread to setTimeout and exec callback function after delay
        //new Worker with param ...
    };


    em.execPeriodically = function(intervalMs, numberOfExecutions, intervalFunc, endingFunc){
        //TODO use worker thread to setTimeout, loop and exec callback function periodically
        //new Worker with param ...
    };


    em.execPeriodically = function(intervalMs, numberOfExecutions, intervalFunc){
        executionManager.execPeriodically(intervalMs, numberOfExecutions, intervalFunc, null);
    };



}(this.executionManager = this.executionManager || {}));
