package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 16/01/15.
 */
public class MapOption {
    private String mapType;
    private boolean borders;
    private boolean roads;
    private boolean showCityNames;
    private boolean showRiverNames;
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

    public boolean isRoads() {
        return roads;
    }

    public void setRoads(boolean roads) {
        this.roads = roads;
    }

    public boolean isShowCityNames() {
        return showCityNames;
    }

    public void setShowCityNames(boolean showCityNames) {
        this.showCityNames = showCityNames;
    }

    public boolean isShowRiverNames() {
        return showRiverNames;
    }

    public void setShowRiverNames(boolean showRiverNames) {
        this.showRiverNames = showRiverNames;
    }
}
