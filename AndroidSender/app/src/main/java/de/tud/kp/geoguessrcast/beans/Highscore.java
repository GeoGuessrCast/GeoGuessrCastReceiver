package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 06/02/15.
 */
public class Highscore {

    private String userMac;
    private String name;
    private int points;
    private int totalPoints;
    private int pointsPercent;

    public Highscore() {
    }

    public String getUserMac() {
        return userMac;
    }

    public void setUserMac(String userMac) {
        this.userMac = userMac;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getPointsPercent() {
        return pointsPercent;
    }

    public void setPointsPercent(int pointsPercent) {
        this.pointsPercent = pointsPercent;
    }
}
