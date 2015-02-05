package de.tud.kp.geoguessrcast.beans;

import android.graphics.Color;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Kaijun on 10/12/14.
 */
public class User {

    private static User mInstance =null;

    private String userName = "";
    private String userMac = "";
    private boolean isAdmin = false;
    private String event_type = "createUser";
    private String color;
    private int points=0;

    public User() {
    }

    public User(String userName, String userMac) {
        this.userName = userName;
        this.userMac = userMac;
        this.isAdmin = false;
        this.event_type = "createUser";
    }

    public static User getInstance(){
        if(mInstance == null)
        {
            mInstance = new User();
        }
        return mInstance;
    }

    public static void resetInstance(){
        mInstance = null;
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
