(function(em){

    /**
     * to be deleted
     */
    em.test = function(){
        console.log('test called!');
    };
    em.testEnde = function(){
        console.log('test ENDE called!');
    };

    /**
     * executes a given callback function after a given time
     * @param {number} delayMs
     * @param {function} callbackFunc
     */
    em.execDelayed = function(delayMs, callbackFunc){
        var w;
        if(typeof(Worker) != 'undefined' ){
            w = new Worker('js/delayTimer.js');
            w.postMessage({'delay':  parseInt(delayMs)});
        }

        w.onmessage = function(e) {
            var data = e.data;
            if(data.success === true) {
                if(callbackFunc && typeof callbackFunc === 'function'){
                    callbackFunc();
                }
            }
        }
    };

    /**
     * executes a given function periodically a certain amount of times, executes optional function on last iterations
     * @param {number} intervalMs
     * @param {number} numberOfExecutions
     * @param {function} intervalFunc
     * @param {function} endingFunc
     * @returns {boolean}
     */
    em.execPeriodically = function(intervalMs, numberOfExecutions, intervalFunc, endingFunc){
        if(parseInt(numberOfExecutions) === 0) return true;

        var w;
        if(typeof(Worker) != 'undefined' ){
            w = new Worker('js/delayTimer.js');
            w.postMessage({'delay':  parseInt(intervalMs)});
        }

        w.onmessage = function(e) {
            var data = e.data;
            if(data.success === true) {
                if(parseInt(numberOfExecutions) > 0) {
                    console.log('number of exec: ' + numberOfExecutions);
                    if (intervalFunc && typeof intervalFunc === 'function') {
                        intervalFunc();
                    }

                    if (parseInt(numberOfExecutions) === 1) { // last iteration
                        if (endingFunc && typeof endingFunc === 'function') {
                            endingFunc();
                        }
                    } else {
                        em.execPeriodically(intervalMs, numberOfExecutions - 1, intervalFunc, endingFunc);
                    }
                }
            }
        };
    };

}(this.executionManager = this.executionManager || {}));
