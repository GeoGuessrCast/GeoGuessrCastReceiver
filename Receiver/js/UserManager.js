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
    castReceiver.User = function(senderId, name, mac, admin){
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
     * get the array of current {User}s
     * @returns {Array.<User>}
     * @private
     */
    function _getUserList(){
        //dataManager.get
        var userList = dataManager.getValue('userList') || "[]";
        return JSON.parse(userList);
    }

    /**
     * sets the {User} list
     * @param {Array.<User>} userList
     * @private
     */
    function _setUserList(userList) {
        var userListLocal = userList || [];
        dataManager.setValue('userList', JSON.stringify(userListLocal));
        return userListLocal;
    }

    /**
     * adds a {User}
     * @param {User} user
     */
    castReceiver.addUser = function(user) {
        // update user list
        var userList = _getUserList();
        userList.push(user);
        _setUserList(userList);

        // update #userList
        $('#userList').find('ul').append('<li id="sender-'+user.senderId+'">'+user.name+'</li>');
    };

    /**
     * returns an array of current users
     * @returns {Array.<User>}
     */
    castReceiver.getUserList = function(){
        return _getUserList();
    };

    /**
     * removes a {User} with the given id
     * @param {number} userId
     */
    castReceiver.removeUser = function(userId){
        // update user list
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[0].senderId === userId){
                userList.splice(i, 1);
                break;
            }
        }
        _setUserList(userList);

        // update #userList
        $('#sender-'+userId).remove();
    };

    /**
     * when user with this userId already exists in localStorage, then return true, otherwise return false
     * @returns {boolean}
     * @param {number} userId
     */
    castReceiver.hasUser = function(userId){
        // update user list
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].senderId === userId){
                return true;
            }
        }
        return false;
    };

}(this.userManager = this.userManager || {}));
