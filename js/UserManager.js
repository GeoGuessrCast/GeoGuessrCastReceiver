(function(castReceiver){

    /**
     *
     * @param name
     * @constructor
     */
    function User(name){
        /** @type {int} */
        this.id = 0;
        /** @type {string} */
        this.name = name;
        /** @type {int} */
        this.pointsInCurrentGame = 0;
        /** @type {boolean} */
        this.admin = false;
    }
    //private variables and methods
    var privVar = '...';

    function _getUserList(){
        //dataManager.get
        var userList = dataManager.getValue('userList') || "[]";
        return JSON.parse(userList);
    }

    /**
     * add a {User}
     * @param {User} user
     */
    castReceiver.addUser = function(user) {

    };

    /**
     * removes a {User} with the given id
     * @param {number} userId
     */
    castReceiver.removeUser = function(userId){

    };
}(this.userManager = this.userManager || {}));
