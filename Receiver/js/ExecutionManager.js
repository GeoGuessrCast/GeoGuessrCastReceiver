(function(em){
    /**
     * executes a given callback function after a given time
     * @param {number} delayMs
     * @param {function} callbackFunc
     */
    em.execDelayed = function(delayMs, callbackFunc){
        return em.execPeriodically(delayMs, 1, null, callbackFunc);
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
        var count = ~~numberOfExecutions,
        delay = ~~intervalMs;

        if(intervalMs <= 0){
            if (endingFunc && typeof endingFunc === 'function') {
                endingFunc();
            }
            return null;
        }
        if(count === 0){
            return null;
        }

        var w;
        if(typeof(Worker) != 'undefined' ){
            w = new Worker('js/delayTimer.js');
            w.postMessage({'delay':  delay, 'repeat': count});
        }

        w.onmessage = function(e) {
            var data = e.data;

            //console.log('period tick! ' +data.tick);
            if(data.tick >= 0) {
                if (intervalFunc && typeof intervalFunc === 'function') {
                    intervalFunc();
                }

                if (data.tick === 0) { // last iteration
                    if (endingFunc && typeof endingFunc === 'function') {
                        endingFunc();
                    }
                    _stopWorker(w);
                    //return null;
                }
            }
        };
        return w;
    };

    /**
     * stops the given web worker
     * @param {Worker} worker
     * @private
     */
    function _stopWorker(worker){
        if(typeof worker!== 'undefined'){
            //console.log('worker terminated!');
            worker.terminate();
        }
    }

}(this.executionManager = this.executionManager || {}));
