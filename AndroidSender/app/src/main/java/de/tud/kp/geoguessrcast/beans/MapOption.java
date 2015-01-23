package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 16/01/15.
 */
public class MapOption {
    private String mapType;
    private boolean borders;
    private boolean showCountryNames;

    public String getMapType() {
        return mapType;
    }

    public void setMapType(String mapType) {
        this.mapType = mapType;
    }

    public boolean isBorders() {
        return borders;
    }

    public void setBorders(boolean borders) {
        this.borders = borders;
    }

    public boolean isShowCountryNames() {
        return showCountryNames;
    }

    public void setShowCountryNames(boolean showCountryNames) {
        this.showCountryNames = showCountryNames;
    }
}
