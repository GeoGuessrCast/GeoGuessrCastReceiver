package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 16/01/15.
 */
public class GameProfile {
    private String profileName;
    private int id;
    private String limitedCountry;
    private boolean multipleChoiceMode;
    private boolean pointingMode;
    private int minTotalCities;
    private int minCountryPopulation;
    private int minPopulationDefault;
    private double scoreWeightFactor;
    private int timePerRoundSec;
    private MapOption mapOption;


    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLimitedCountry() {
        return limitedCountry;
    }

    public void setLimitedCountry(String limitedCountry) {
        this.limitedCountry = limitedCountry;
    }

    public boolean isMultipleChoiceMode() {
        return multipleChoiceMode;
    }

    public void setMultipleChoiceMode(boolean multipleChoiceMode) {
        this.multipleChoiceMode = multipleChoiceMode;
    }

    public MapOption getMapOption() {
        return mapOption;
    }

    public void setMapOption(MapOption mapOption) {
        this.mapOption = mapOption;
    }

    public int getMinPopulationDefault() {
        return minPopulationDefault;
    }

    public void setMinPopulationDefault(int minPopulationDefault) {
        this.minPopulationDefault = minPopulationDefault;
    }

    public int getTimePerRoundSec() {
        return timePerRoundSec;
    }

    public void setTimePerRoundSec(int timePerRoundSec) {
        this.timePerRoundSec = timePerRoundSec;
    }

    public boolean isPointingMode() {
        return pointingMode;
    }

    public void setPointingMode(boolean pointingMode) {
        this.pointingMode = pointingMode;
    }

    public int getMinTotalCities() {
        return minTotalCities;
    }

    public void setMinTotalCities(int minTotalCities) {
        this.minTotalCities = minTotalCities;
    }

    public int getMinCountryPopulation() {
        return minCountryPopulation;
    }

    public void setMinCountryPopulation(int minCountryPopulation) {
        this.minCountryPopulation = minCountryPopulation;
    }

    public double getScoreWeightFactor() {
        return scoreWeightFactor;
    }

    public void setScoreWeightFactor(double scoreWeightFactor) {
        this.scoreWeightFactor = scoreWeightFactor;
    }
}
