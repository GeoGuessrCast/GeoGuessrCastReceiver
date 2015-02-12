(function(um){

    // init
    /** @type Array.<User> */
    var userList = [];
    var staticUserColors = [
        //TODO more colors
        '#C62828',     //Red
        '#6A1B9A',   //Purple
        '#283593',   //Indigo
        '#00838F',  //Cyan
        '#2E7D32',   //Green
        '#F9A825',   //Yellow
        '#5E342E',    //Brown
        '#223232',      //Grey
        '#000000',     //Black
        '#AD1457'    //Pink
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
        /** @type {number} */
        this.maxPointsInCurrentGame = 0;
        /** @type {Answer} */
        this.lastAnswerGiven = null;
        /** @type {boolean} */
        this.admin = admin;

        this.isAdmin = function() {
          return this.admin;
        };

        this.id = _getFreeUserId();

        /** @type {string} **/
        this.getColor = function() {
            return this.getStaticColor();
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
        var user = null;
        if (!hasUser) {
            //add new User
            var isAdmin = false;
            if (userManager.getUserList().length === 0) {
                isAdmin = true;
            }
            user = new userManager.User(event.senderId, trimmedName, event.data.userMac, isAdmin);
            userManager.addUser(user);
        } else {
            // update name and senderId
            user = userManager.updateUser(event.data.userMac, trimmedName, event.senderId);
        }
        //inform the Sender if the user is game leader
        var jsonData;
        if (user.isAdmin()) {
            jsonData = {event_type:data.eventType.isAdmin, admin:true, user_color: user.getColor(), gameModes: data.gameMode, gameProfiles: data.gameModeProfile};
        } else {
            jsonData = {event_type:data.eventType.isAdmin, admin:false, user_color: user.getColor()};
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
        console.debug('userLeft: ' + senderId);
        var adminLeft = false;
        var userList = _getUserList();
        var userLength = userList.length;
        for(var i = 0; i < userLength; i++){
            if(userList[i].senderId === senderId){
                if (userList[i].isAdmin()) {
                    adminLeft = true;
                }
                userList.splice(i, 1);
                $('#'+userList[i].mac).remove();
                break;
            }
        }
        if (adminLeft && userList.length > 0) {
            var newAdmin = userList[0];
            console.debug('setting new admin: ' + newAdmin.name);
            newAdmin.admin = true;
            var jsonData = {event_type:data.eventType.isAdmin, admin:true, user_color: newAdmin.getColor(), gameModes: data.gameMode, gameProfiles: data.gameModeProfile};
            eventManager.send(newAdmin.senderId, data.channelName.user, jsonData);
        }
        _setUserList(userList);
        if (gameRoundManager.currentGameState == data.gameState.ended) {
            renderManager.rebuildUserList();
        } else {
            renderManager.refreshBottomScoreboard();
        }

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
                return userList[i];
            }
        }
        _setUserList(userList);
        return null;
    };


    um.sortUsersByScore = function() {
      userList.sort(function(u1, u2){
          return u2.pointsInCurrentGame - u1.pointsInCurrentGame;
      });
    };


}(this.userManager = this.userManager || {}));
