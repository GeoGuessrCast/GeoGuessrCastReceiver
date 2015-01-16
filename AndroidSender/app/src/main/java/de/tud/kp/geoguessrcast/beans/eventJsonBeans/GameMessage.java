package de.tud.kp.geoguessrcast.beans.eventJsonBeans;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Created by Kaijun on 12/12/14.
 */
public class GameMessage {
    String event_type;
    int gameMode;
    boolean started;
    int timerRound;
    String[] choices;
    boolean ended;
    int roundNumber;

    boolean multipleChoiceMode;

    public boolean isMultipleChoiceMode() {
        return multipleChoiceMode;
    }

    public void setMultipleChoiceMode(boolean multipleChoiceMode) {
        this.multipleChoiceMode = multipleChoiceMode;
    }

    public GameMessage(){
    }

    public String getEvent_type() {
        return event_type;
    }

    public void setEvent_type(String event_type) {
        this.event_type = event_type;
    }

    public int getGameMode() {
        return gameMode;
    }

    public void setGameMode(int gameMode) {
        this.gameMode = gameMode;
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
}
