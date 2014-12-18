package de.tud.kp.geoguessrcast.beans;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Kaijun on 10/12/14.
 */
public class User {
    private String userName;
    private String userMac;
    private boolean isAdmin;
    private String event_type;

    public User(String userName, String userMac) {
        this.userName = userName;
        this.userMac = userMac;
        this.isAdmin = false;
        this.event_type = "createUser";
    }

    public String toJSONString(){
        JSONObject userData = new JSONObject();
        try {
            userData.put("userName", this.userName).put("userMac", this.userMac).put("event_type", this.event_type);
        }catch (JSONException ex) {
            throw new RuntimeException(ex);
        }
        return  userData.toString();
    }

    public String getUserName() {
        return userName;
    }

    public String getUserMac() {
        return userMac;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserMac(String userMac) {
        this.userMac = userMac;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }
}
