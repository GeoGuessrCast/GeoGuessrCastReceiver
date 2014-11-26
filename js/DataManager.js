(function(castReceiver){

    //private variables and methods
    var privVar = '...';


    /**
     * Checks support for local storage
     * @returns {boolean}
     * @private
     */
    function _checkStorageSupport() {
        return typeof(Storage)!=="undefined";
    }

    /**
     * returns the value for a given key, null if not found
     * @param {string} key
     * @returns {string|boolean|number}
     */
    castReceiver.getValue = function(key){
        //if(!localStorage.hasOwnProperty(key)) return null;
        return localStorage.getItem(key);
    };

    /**
     * sets the value for a given key in local storage
     * @param {string} key
     * @param {boolean|number|string} value
     * @returns {boolean|number|string}
     */
      castReceiver.setValue = function(key, value){
        localStorage.setItem(key, value);
        return value;
    };

}(this.dataManager = this.dataManager || {}));
