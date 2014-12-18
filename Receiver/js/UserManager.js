(function(castReceiver){

    // init
    // set empty user list
    dataManager.setValue('userList', JSON.stringify([]));

    /**
     * Type User
     * @param {number} senderId
     * @param {string} name
     * @param {string} mac
     * @param {boolean} admin
     * @constructor
     */
    castReceiver.User = function(senderId, name, mac, admin){
        /** @type {number} */
        this.senderId = senderId;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.mac = mac;
        /** @type {number} */
        this.pointsInCurrentGame = 0;
        /** @type {boolean} */
        this.admin = admin;
        /** @type {string} **/
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16);
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


        userManager.rebuildUserList();
        userManager.refreshBottomScoreboard(); //TODO call only 1 function - depending on gameState
    };

    /**
     *
     */
    castReceiver.rebuildUserList = function() {
        var userCssClass;
        var userList = _getUserList();
        var userLength = userList.length;
        $('#mainMenuUserList').find('ul').html('');
        for(var i = 0; i < userLength; i++){
            if (userList[i].admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            $('#mainMenuUserList').find('ul').append('<li class="' + userCssClass + '" id="'+userList[i].mac+'">'+userList[i].name+'</li>');
        }
    };

    /**
     *
     */
    castReceiver.refreshBottomScoreboard = function() {
        var userCssClass;
        var userList = _getUserList();
        var userLength = userList.length;
        $('#bottomScoreboard').find('ul').html('');
        for(var i = 0; i < userLength; i++){
            if (userList[i].admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            $('#bottomScoreboard').find('ul').append('<li class="' + userCssClass + '" id="'+userList[i].mac
            + '"><span>' + userList[i].name + ': <span class="score">' + userList[i].pointsInCurrentGame + '</span></span></li>');
        }
    };

    /**
     * returns an array of current users
     * @returns {Array.<User>}
     */
    castReceiver.getUserList = function(){
        return _getUserList();
    };

    /**
     * checks if an {User} with a given senderId exists in storage
     * @param {string} senderId
     * @returns {boolean}
     */
    castReceiver.hasUser = function(senderId){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].senderId === senderId){
                return true;
            }
        }
        return false;
    };

    /**
     * checks if an {User} with a given mac address exists in local storage
     * @returns {boolean}
     * @param {string} mac
     */
    castReceiver.hasUserMac = function(mac){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].mac === mac){
                return true;
            }
        }
        return false;
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
        $('#sender-'+userId).remove(); //TODO use MAC as userId, completly remove senderIds
    };

    /**
     * sets user list
     * @param {Array.<User>} userList
     */
    castReceiver.setUserList = function(userList){
        _setUserList(userList);
    };

    /**
     * update an {User}'s name and senderId
     * @param {string} mac
     * @param {string} userName
     * @param {string} senderId
     */
    castReceiver.updateUser = function(mac, userName, senderId){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[0].mac === mac){
                userList[0].senderId = senderId;
                userList[0].name = userName;
                break;
            }
        }
        _setUserList(userList);
    };
}(this.userManager = this.userManager || {}));
