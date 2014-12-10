package de.tud.kp.geoguessrcast.beans;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Kaijun on 10/12/14.
 */
public class User {
    private String userName;
    private String userMac;

    public User(String userName, String userMac) {
        this.userName = userName;
        this.userMac = userMac;
    }

    public String toJSONString(){
        JSONObject userData = new JSONObject();
        try {
            userData.put("userName", this.userName).put("userMac", this.userMac);
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

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserMac(String userMac) {
        this.userMac = userMac;
    }
}
