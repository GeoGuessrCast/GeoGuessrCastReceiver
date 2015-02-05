package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 16/01/15.
 */
public class GameMode {
    private String gameModeName;
    private int id;
    private int geoObjType;
    private String iconCssClass;

    public String getGameModeName() {
        return gameModeName;
    }

    public void setGameModeName(String gameModeName) {
        this.gameModeName = gameModeName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getGeoObjType() {
        return geoObjType;
    }

    public void setGeoObjType(int geoObjType) {
        this.geoObjType = geoObjType;
    }

    public String getIconCssClass() {
        return iconCssClass;
    }

    public void setIconCssClass(String iconCssClass) {
        this.iconCssClass = iconCssClass;
    }
}
