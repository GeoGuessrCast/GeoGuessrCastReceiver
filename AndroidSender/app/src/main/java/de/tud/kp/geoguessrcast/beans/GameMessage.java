package de.tud.kp.geoguessrcast.beans;

import com.countrypicker.Country;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Created by Kaijun on 12/12/14.
 */
public class GameMessage {
    String event_type;
    boolean started;
    int timerRound;
    String[] choices;
    boolean ended;
    int roundNumber;
    int maxRounds;
    boolean multipleChoiceMode;
    boolean pointingMode;
    boolean admin;
    GameMode[] gameModes;
    GameMode gameMode;
    GameProfile[] gameProfiles;
    GameProfile gameProfile;
    String answer;
    String userMac;
    String user_color;
    String bounds;
    String mapTypeTemplate;
    double hardness;
    String countryCode;



    String correctAnswer;
    String userAnswer;
    double answerDistance;
    int pointsEarned;

    Highscore[] highScoreList;
    Highscore[] localHighScoreList;

    Country[] countries;

    public GameMessage(){
    }


    public boolean isMultipleChoiceMode() {
        return multipleChoiceMode;
    }

    public void setMultipleChoiceMode(boolean multipleChoiceMode) {
        this.multipleChoiceMode = multipleChoiceMode;
    }

    public String getEvent_type() {
        return event_type;
    }

    public void setEvent_type(String event_type) {
        this.event_type = event_type;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public int getTimerRound() {
        return timerRound;
    }

    public void setTimerRound(int timerRound) {
        this.timerRound = timerRound;
    }

    public String[] getChoices() {
        shuffleArray(choices);
        return choices;
    }

    public void setChoices(String[] choices) {
        this.choices = choices;
    }

    public boolean isEnded() {
        return ended;
    }

    public void setEnded(boolean ended) {
        this.ended = ended;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    static void shuffleArray(String[] ar)
    {
        Random rnd = new Random();
        for (int i = ar.length - 1; i > 0; i--)
        {
            int index = rnd.nextInt(i + 1);
            // Simple swap
            String a = ar[index];
            ar[index] = ar[i];
            ar[i] = a;
        }
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean isAdmin) {
        this.admin = isAdmin;
    }

    public GameMode[] getGameModes() {
        return gameModes;
    }

    public void setGameModes(GameMode[] gameModes) {
        this.gameModes = gameModes;
    }

    public GameProfile[] getGameProfiles() {
        return gameProfiles;
    }

    public void setGameProfiles(GameProfile[] gameProfiles) {
        this.gameProfiles = gameProfiles;
    }

    public GameMode getGameMode() {
        return gameMode;
    }

    public void setGameMode(GameMode gameMode) {
        this.gameMode = gameMode;
    }

    public GameProfile getGameProfile() {
        return gameProfile;
    }

    public void setGameProfile(GameProfile gameProfile) {
        this.gameProfile = gameProfile;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getUserMac() {
        return userMac;
    }

    public void setUserMac(String userMac) {
        this.userMac = userMac;
    }

    public String getUser_color() {
        return user_color;
    }

    public void setUser_color(String user_color) {
        this.user_color = user_color;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }

    public double getAnswerDistance() {
        return answerDistance;
    }

    public void setAnswerDistance(double answerDistance) {
        this.answerDistance = answerDistance;
    }

    public int getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(int pointsEarned) {
        this.pointsEarned = pointsEarned;
    }
//

    public int getMaxRounds() {
        return maxRounds;
    }

    public void setMaxRounds(int maxRounds) {
        this.maxRounds = maxRounds;
    }

    public Highscore[] getHighScoreList() {
        return highScoreList;
    }

    public void setHighScoreList(Highscore[] highScoreList) {
        this.highScoreList = highScoreList;
    }

    public boolean isPointingMode() {
        return pointingMode;
    }

    public void setPointingMode(boolean pointingMode) {
        this.pointingMode = pointingMode;
    }

    public double[] getBounds() {
        if(bounds!=null){
            String[] splitResult = bounds.split(",");
            double[] boundsArray = new double[4];
            boundsArray[0] = Double.parseDouble(splitResult[0].substring(2));
            boundsArray[1] = Double.parseDouble(splitResult[1].substring(0,splitResult[1].length()-1));
            boundsArray[2] = Double.parseDouble(splitResult[2].substring(2));
            boundsArray[3] = Double.parseDouble(splitResult[3].substring(0,splitResult[3].length()-2));
            return boundsArray;
        }
        else{
            return null;
        }
    }

    public void setBounds(String bounds) {
        this.bounds = bounds;
    }

    public String getMapTypeTemplate() {
        return mapTypeTemplate;
    }

    public void setMapTypeTemplate(String mapTypeTemplate) {
        this.mapTypeTemplate = mapTypeTemplate;
    }

    public Highscore[] getLocalHighScoreList() {
        return localHighScoreList;
    }

    public void setLocalHighScoreList(Highscore[] localHighScoreList) {
        this.localHighScoreList = localHighScoreList;
    }

    public double getHardness() {
        return hardness;
    }

    public void setHardness(double hardness) {
        this.hardness = hardness;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public Country[] getCountries() {
        return countries;
    }

    public void setCountries(Country[] countries) {
        this.countries = countries;
    }
}
