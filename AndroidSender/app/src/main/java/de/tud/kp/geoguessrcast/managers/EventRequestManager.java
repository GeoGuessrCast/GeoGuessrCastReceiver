package de.tud.kp.geoguessrcast.managers;

import android.app.Activity;
import android.util.Log;

import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.WelcomeActivity;

/**
 * Created by Kaijun on 09/04/15.
 */
public class EventRequestManager {

    private final String USER_CHANNEL;
    private final String ADMIN_CHANNEL;
    private final String GAME_CHANNEL;

    private static DataCastManager sCastManager;


    public EventRequestManager(GameActivity activity) {
        
        sCastManager = activity.getCastManager();

        USER_CHANNEL = activity.getString(R.string.userChannel);
        ADMIN_CHANNEL = activity.getString(R.string.adminChannel);
        GAME_CHANNEL = activity.getString(R.string.gameChannel);
    }

    public EventRequestManager(WelcomeActivity activity) {

        sCastManager = activity.getCastManager();

        USER_CHANNEL = activity.getString(R.string.userChannel);
        ADMIN_CHANNEL = activity.getString(R.string.adminChannel);
        GAME_CHANNEL = activity.getString(R.string.gameChannel);
    }

    private void sendEventRequest(String json, String channalName){
        try {
            sCastManager.sendDataMessage(json,  channalName);
        } catch (Exception e) {
            Log.e("CastManager", "Exception while sending message", e);
        }
    }

    public void sendCreateUserReq(String userJson){
        sendEventRequest(userJson, USER_CHANNEL);
    }
    public void sendHighScoreReq(String eventMsg){
        sendEventRequest(eventMsg, USER_CHANNEL);
    }
    public void sendAnswerChosenReq(String eventMsg){
        sendEventRequest(eventMsg, USER_CHANNEL);
    }


    public void sendHideConsoleReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendRestartReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendSetHardnesstReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendLoadHighScoreReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendLoadMainMenuReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendSetGameModeReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }
    public void sendSetGameProfileReq(String eventMsg){
        sendEventRequest(eventMsg, ADMIN_CHANNEL);
    }


}
