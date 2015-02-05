(function(um){

    // init
    /** @type Array.<User> */
    var userList = [];
    var staticUserColors = [
        'hsl(0, 100%, 30%)', //TODO more colors
        'hsl(20, 100%, 30%)'
    ];

    /**
     * Type User
     * @param {number} senderId
     * @param {string} name
     * @param {string} mac
     * @param {boolean} admin
     * @constructor
     */
    um.User = function(senderId, name, mac, admin){
        /** @type {number} */
        this.senderId = senderId;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.mac = mac;
        /** @type {number} */
        this.pointsInCurrentGame = 0;
        /** @type {Answer} */
        this.lastAnswerGiven = null;
        /** @type {boolean} */
        this.admin = admin;

        this.id = _getFreeUserId();

        /** @type {string} **/
        this.getColor = function() {
            return this.getUniformDistributedHslColor();
        };

        this.getUniformDistributedHslColor = function() {
            var huePercent = this.id / userManager.getNumberOfUsers();
            return 'hsl(' + huePercent*360 + ', 100%, 30%)';
        };

        this.getStaticColor = function() {
            return staticUserColors[this.id % staticUserColors.length];
        };

    };
    um.User.prototype.toString = function() {
        return name;
    };

    function _getFreeUserId(){
        var takenIds = [];
        for (var i = 0; i < userList.length; i++) {
            takenIds.push(userList[i].id);
        }
        for (var id = 0; id<=userList.length; id++) {
            if (!takenIds.contains(id)) {
                return id;
            }
        }
    }

    /**
     * get the array of current {User}s
     * @returns {Array.<User>}
     * @private
     */
    function _getUserList(){
        return userList;
    }

    /**
     * sets the {User} list
     * @param {Array.<User>} updatedUserList
     * @returns {Array.<User>}
     * @private
     */
    function _setUserList(updatedUserList) {
        userList = updatedUserList;
        return userList;
    }

    /**
     * adds a {User}
     * @param {User} user
     */
    um.addUser = function(user) {
        // update user list
        var userList = _getUserList();
        userList.push(user);
        _setUserList(userList);

        if (gameRoundManager.currentGameState == data.gameState.ended) {
            renderManager.rebuildUserList();
        } else {
            renderManager.refreshBottomScoreboard();
        }
    };

    /**
     * adds a {User}
     * @param {User} user
     */
    um.createOrUpdateUser = function(event) {
        var hasUser = userManager.hasUserMac(event.data.userMac);
        var trimmedName = event.data.userName.replace(/([^a-z0-9_.\s]+)/gi, ' ');
        trimmedName = trimmedName.substring(0, data.constants.maxNameLength);
        if (!hasUser) {
            //add new User
            var isAdmin = false;
            if (userManager.getUserList().length === 0) {
                isAdmin = true;
            }
            var user = new userManager.User(event.senderId, trimmedName, event.data.userMac, isAdmin);
            userManager.addUser(user);
        } else {
            // update name and senderId
            userManager.updateUser(event.data.userMac, trimmedName, event.senderId);
        }
        //inform the Sender if the user is game leader

        var jsonData;
        if (userManager.isUserAdmin(event.data.userMac)) {
            jsonData = {event_type:data.eventType.isAdmin, admin:true,  gameModes: data.gameMode, gameProfiles: data.gameModeProfile};
        } else {
            jsonData = {event_type:data.eventType.isAdmin, admin:false};
        }
        eventManager.send(event.senderId, data.channelName.user, jsonData);

    };


    /**
     * returns a {User} with a given mac address, false otherwise
     * @param {string} mac
     * @returns {User|boolean}
     */
    um.getUserByMac = function(mac){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].mac === mac){
                return userList[i];
            }
        }
        return false;
    };

    /**
     * returns an array of current users
     * @returns {Array.<User>}
     */
    um.getUserList = function(){
        return _getUserList();
    };


    /**
     * @returns Number
     */
    um.getNumberOfUsers = function(){
        return userList.length;
    };

    /**
     * checks if an {User} with a given senderId exists in storage
     * @param {string} senderId
     * @returns {boolean}
     */
    um.hasUser = function(senderId){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].senderId === senderId){
                return true;
            }
        }
        return false;
    };

    ///**
    // * checks if an {User} with a given senderId is Admin
    // * @param {string} senderId
    // * @returns {boolean}
    // */
    //castReceiver.isUserAdmin = function(senderId){
    //    var userList = _getUserList();
    //    var userLength = userList.length;
    //    for(var i = 0; i < userLength; i++){
    //        if(userList[i].senderId === senderId){
    //            return userList[i].admin;
    //        }
    //    }
    //    return false;
    //};

    /**
     * checks if an {User} with a given mac address is Admin
     * @param {string} mac
     * @returns {boolean}
     */
    um.isUserAdmin = function(mac){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].mac === mac){
                return userList[i].admin;
            }
        }
        return false;
    };

    /**
     * checks if an {User} with a given mac address exists in local storage
     * @returns {boolean}
     * @param {string} mac
     */
    um.hasUserMac = function(mac){
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
     * @param {string} senderId
     */
    um.removeUser = function(senderId){
        // update user list
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].senderId === senderId){
                userList.splice(i, 1);
                $('#'+userList[i].mac).remove();
                break;
            }
        }
        _setUserList(userList);
        if (gameRoundManager.currentGameState == data.gameState.ended) {
            renderManager.rebuildUserList();
        } else {
            renderManager.refreshBottomScoreboard();
        }

    };

    /**
     * removes a {User} with the given id
     * @param {string} mac
     */
    um.removeUser = function(mac){
        // update user list
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].mac === mac){
                userList.splice(i, 1);
                $('#'+userList[i].mac).remove();
                break;
            }
        }
        _setUserList(userList);
    };

    /**
     * sets user list
     * @param {Array.<User>} userList
     */
    um.setUserList = function(userList){
        _setUserList(userList);
    };

    /**
     * update an {User}'s name and senderId
     * @param {string} mac
     * @param {string} userName
     * @param {string} senderId
     */
    um.updateUser = function(mac, userName, senderId){
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].mac === mac){
                userList[i].senderId = senderId;
                userList[i].name = userName;
                break;
            }
        }
        _setUserList(userList);
    };


    um.sortUsersByScore = function() {
      userList.sort(function(u1, u2){
          return u2.pointsInCurrentGame - u1.pointsInCurrentGame;
      });
    };


}(this.userManager = this.userManager || {}));
