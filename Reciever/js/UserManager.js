(function(castReceiver){

    // init
    // set empty user list
    dataManager.setValue('userList', JSON.stringify([]));


    /**
     * Type User
     * @param {number} senderId
     * @param {string} name
     * @param {boolean} admin
     * @constructor
     */
    castReceiver.User = function(senderId, name, admin){
        /** @type {number} */
        this.senderId = senderId;
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.pointsInCurrentGame = 0;
        /** @type {boolean} */
        this.admin = admin;
    };

    /**
     * get the list of current users
     * @returns {Array.<User>}
     * @private
     */
    function _getUserList(){
        //dataManager.get
        var userList = dataManager.getValue('userList') || "[]";
        return JSON.parse(userList);
    }

    /**
     * add a User
     * @param {User} user
     */
    castReceiver.addUser = function(user) {
        // update user list
        // update #userList
        $('#userList').find('ul').append('<li id="sender-'+user.senderId+'">'+user.name+'</li>')
    };

    /**
     * removes a {User} with the given id
     * @param {number} userId
     */
    castReceiver.removeUser = function(userId){
        // update user list
        // update #userList
        $('#sender-'+userId).remove();
    };
}(this.userManager = this.userManager || {}));
