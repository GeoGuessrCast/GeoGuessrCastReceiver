package de.tud.kp.geoguessrcast.managers;

import android.util.Log;

import com.countrypicker.Country;
import com.google.gson.Gson;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.WelcomeActivity;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.fragments.ChooseHardnessAndCountryFragment;
import de.tud.kp.geoguessrcast.fragments.ChooseModeFragment;
import de.tud.kp.geoguessrcast.fragments.ChooseProfileFragment;
import de.tud.kp.geoguessrcast.fragments.CustomizeProfileFragment;
import de.tud.kp.geoguessrcast.fragments.FreeChoiceModeFragment;
import de.tud.kp.geoguessrcast.fragments.MultipleChoiceModeFragment;
import de.tud.kp.geoguessrcast.fragments.PointingModeFragment;
import de.tud.kp.geoguessrcast.fragments.WaitGameFragment;
import de.tud.kp.geoguessrcast.fragments.WaitRoundFragment;
import de.tud.kp.geoguessrcast.utilities.DeviceInfo;

/**
 * Created by Kaijun on 09/04/15.
 */
public class GameManager{

    private EventRequestManager mEventRequestMgr;
    private GameSetting mGameSetting;

    public GameManager(WelcomeActivity activity) {
        mEventRequestMgr = new EventRequestManager(activity);
        mGameSetting = GameSetting.getInstance();
    }
    public GameManager(GameActivity activity) {
        mEventRequestMgr = new EventRequestManager(activity);
        mGameSetting = GameSetting.getInstance();
    }


    public void requestCreateUser(){
        mEventRequestMgr.sendCreateUserReq(User.getInstance().toJSONString());
    }

    public void requestHighScore(){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("requestHighScoreList");
        mEventRequestMgr.sendHighScoreReq(new Gson().toJson(gameMessage));
    }

    public void requestHideConsole(boolean isHide){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("hideConsole");
        gameMessage.setHide(isHide);
        mEventRequestMgr.sendHideConsoleReq(new Gson().toJson(gameMessage));
    }

    public void requestRestart(){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("restart");
        mEventRequestMgr.sendRestartReq(new Gson().toJson(gameMessage));
    }

    public void requestSetHardness(double hardness, String countryCode){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("setHardness");
        gameMessage.setHardness(hardness);
        gameMessage.setCountryCode(countryCode);
        mEventRequestMgr.sendSetHardnesstReq(new Gson().toJson(gameMessage));
    }

    public void requestLoadHighScore(){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("loadHighScore");
        mEventRequestMgr.sendLoadHighScoreReq(new Gson().toJson(gameMessage));
    }

    public void requestSetGameMode(GameMode gameMode){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("setGameMode");
        gameMessage.setGameMode(gameMode);
        mEventRequestMgr.sendSetGameModeReq(new Gson().toJson(gameMessage));
    }
    public void requestSetGameProfile(GameProfile gameProfile){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("setGameProfile");
        gameMessage.setGameProfile(gameProfile);
        mEventRequestMgr.sendSetGameProfileReq(new Gson().toJson(gameMessage));
    }
    public void requestAnswerChosen(String answer){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("gameRound_answerChosen");
        gameMessage.setAnswer(answer);
        gameMessage.setUserMac(User.getInstance().getUserMac());
        mEventRequestMgr.sendAnswerChosenReq(new Gson().toJson(gameMessage));
    }

    public void requestAnswerChosen(double latitude, double longitude){
        GameMessage gameMessage = new GameMessage();
        gameMessage.setEvent_type("gameRound_answerChosen");
        String answer = "{\"longitude\":" + longitude + ", \"latitude\":" + latitude + "}";
        gameMessage.setAnswer(answer);
        gameMessage.setUserMac(User.getInstance().getUserMac());
        mEventRequestMgr.sendAnswerChosenReq(new Gson().toJson(gameMessage));
    }

    public void requestLoadMainMenu(){
        GameMessage gameMessage = new GameMessage();
        mEventRequestMgr.sendLoadMainMenuReq(new Gson().toJson(gameMessage));
    }





    public void setupUserInfo(String userName, String userMac){
        User.getInstance().setUserName(userName);
        User.getInstance().setUserMac(userMac);
    }

    public void setupAdmin(GameMode[] gameModes, GameProfile[] gameProfiles, Country[] countries){
        setAdmin(true);
        setGameSetting(gameModes, gameProfiles, countries);
    }

    public void setAdmin(boolean isAdmin){
        User.getInstance().setAdmin(isAdmin);
    }

    public void setGameSetting(GameMode[] gameModes, GameProfile[] gameProfiles, Country[] countries){
        mGameSetting.setGameModes(gameModes);
        mGameSetting.setGameProfiles(gameProfiles);
        mGameSetting.setCountries(countries);
    }


    public void startNewRound(GameActivity activity){
        if(User.getInstance().isAdmin()){
            startChoosingMode(activity, 1);
        }
        else {
            startWaitingGame(activity);
        }
    }


    public void startGame(GameActivity activity){
        if(User.getInstance().isAdmin()){
            startChoosingMode(activity, 0);
        }
        else{
            startWaitingGame(activity);
        }
    }

    public void startWaitingRound(GameActivity activity){
        activity.startFragment(new WaitRoundFragment());
    }
    public void startWaitingGame(GameActivity activity){
        activity.startFragment(new WaitGameFragment());
    }
    public void startChoosingMode(GameActivity activity, int startType){
        activity.startFragment(ChooseModeFragment.newInstance(startType));
    }
    public void startChoosingProfile(GameActivity activity){
        activity.startFragment(new ChooseProfileFragment());
    }
    public void startChoosingHardness(GameActivity activity){
        activity.startFragment(ChooseHardnessAndCountryFragment.newInstance());
    }
    public void startCustomizingProfile(GameActivity activity){
        activity.startFragment(CustomizeProfileFragment.newInstance());
    }
    public void startFreeChoiceMode(GameActivity activity, int roundNumber, int timeRound){
        activity.startFragment(FreeChoiceModeFragment.newInstance(roundNumber, timeRound));
    }

    public void startMultipleChoiceMode(GameActivity activity, int roundNumber, int timeRound, String[] choices){
        activity.startFragment(MultipleChoiceModeFragment.newInstance(roundNumber, timeRound,choices));
    }

    public void startPointingMode(GameActivity activity, double[] bounds, String mapType, int roundNumber, int timeRound){
        activity.startFragment(PointingModeFragment.newInstance( bounds,  mapType, roundNumber, timeRound));
    }


    public void restartGame(GameActivity activity){
        User.resetInstance();
        activity.finish();
    }

    public EventRequestManager getEventRequestMgr(){
        return mEventRequestMgr;
    }

}
