/*
 * Copyright (C) 2014 Google Inc. All Rights Reserved. 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at 
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 */

package de.tud.kp.geoguessrcast;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
//import android.support.v4.app.FragmentManager;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;
import android.media.Image;
import android.os.Bundle;
import android.os.Handler;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.afollestad.materialdialogs.MaterialDialog;
import com.google.android.gms.cast.CastDevice;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;
import com.google.sample.castcompanionlibrary.cast.callbacks.DataCastConsumerImpl;

import de.tud.kp.geoguessrcast.adapters.HighscoreListAdapter;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.fragments.ChooseModeFragment;
import de.tud.kp.geoguessrcast.fragments.GameMode1Fragment;
import de.tud.kp.geoguessrcast.fragments.GameMode2Fragment;
import de.tud.kp.geoguessrcast.fragments.GameMode3Fragment;
import de.tud.kp.geoguessrcast.fragments.WaitGameFragment;
import de.tud.kp.geoguessrcast.managers.ProfileBarManager;

/**
 * Main activity to send messages to the receiver.
 */

/*
TODO: separate all Control flow, e.g. GameManager: start game, start waiting, show optionMenu...
TODO: all Fragments reference!!! not always new!!!
 */

public class GameActivity extends ActionBarActivity {

    public static final String TAG = GameActivity.class.getSimpleName();

    private static final int REQUEST_CODE = 1;

    private Menu mOptionMenu;
    private boolean doubleBackToExitPressedOnce;
    //TODO: change back to public / mUser
    private User mUser;
    private static DataCastManager sCastManager;
    private static DataCastConsumerImpl sCastManagerConsumer;
    private Context mContext;

    private ProfileBarManager mProfileBarMgr;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mContext = this;

        mUser = User.getInstance();
        mProfileBarMgr = new ProfileBarManager(this);

        mProfileBarMgr.initProfileBar();

        //Setup CastManager
        try{
            sCastManager = DataCastManager.getInstance();
        }
        catch (Exception e){
            Log.e(TAG, "DataCastManager Instance doesn't exist!");
        }
        //set EventListener for DataCastManager
        sCastManagerConsumer = new DataCastConsumerImpl(){
            @Override
            public void onDisconnected(){
                //TODO: GameManager - restartGame - resetAll!!!
                User.resetInstance();
                ((Activity)mContext).finish();
            }
            @Override
            public void onMessageReceived(CastDevice castDevice, String namespace, String message) {
                if (namespace.equals(getString(R.string.adminChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    if(gameMessage.getEvent_type().equals("restart")){
                        //TODO: GameManager - restartGame - resetAll!!!
                        User.resetInstance();
                        //TODO: GameManager-initStartPage...
                        ((Activity)mContext).finish();
                    }
                    Log.d(TAG, "onMessageReceived from AdminChannel: " + message);
                }
                else if (namespace.equals(getString(R.string.gameChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    Log.d(TAG, "onMessageReceived from GameChannel: " + message);
                    if(gameMessage.getEvent_type().equals("startGame")){
                        if(gameMessage.isStarted()){
                            int roundNumber = gameMessage.getRoundNumber();
                            int timeRound = gameMessage.getTimerRound();
                            int maxRounds = gameMessage.getMaxRounds();
                            mProfileBarMgr.updateRound(roundNumber, maxRounds);
                            mProfileBarMgr.initPointInfo();
                            if(gameMessage.isMultipleChoiceMode()){
                                String[] choices = gameMessage.getChoices();
                                startFragment(GameMode2Fragment.newInstance(roundNumber, timeRound, choices));
                            }
                            else if(gameMessage.isPointingMode()){
                                double[] defaultBounds = gameMessage.getBounds();
                                String mapType = gameMessage.getMapTypeTemplate();
                                startFragment(GameMode3Fragment.newInstance(defaultBounds, mapType, roundNumber, timeRound));
                            }
                            else{
                                startFragment(GameMode1Fragment.newInstance(roundNumber, timeRound));
                            }
                        }
                    }
                    else if(gameMessage.getEvent_type().equals("round_ended")) {
                        if (gameMessage.isEnded() == true) {
                            int pointsEarned = gameMessage.getPointsEarned();
                            mProfileBarMgr.updatePoint(pointsEarned);
                        }
                    }
                    else if(gameMessage.getEvent_type().equals("game_ended")){
                        if(gameMessage.isEnded()==true){
                            //TODO:  EventTransitionMngr: request HighScoreList!!!
                            try {
                                GameMessage gameMessageToSend = new GameMessage();
                                gameMessageToSend.setEvent_type("requestHighScoreList");
                                sCastManager.sendDataMessage(new Gson().toJson(gameMessageToSend), getString(R.string.userChannel));
                            }
                            catch (Exception e) {
                            }

                            if(mUser.isAdmin()){
                                startFragment(ChooseModeFragment.newInstance(1));
                            }
                            else {
                                startFragment(new WaitGameFragment());
                            }
                        }
                    }
                }
                else if (namespace.equals(getString(R.string.userChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    Log.d(TAG, "onMessageReceived from UserChannel: " + message);
                    if(gameMessage.getEvent_type().equals("answer_feedback")){
                        int pointsEarned = gameMessage.getPointsEarned();
                        mProfileBarMgr.updatePoint(pointsEarned);
                    }
                    else if(gameMessage.getEvent_type().equals("isAdmin")){
                        mUser.setColor(gameMessage.getUser_color());
                        if(gameMessage.isAdmin()==true){
                            //TODO: admin setup ()...
                            mUser.setAdmin(true);
                            GameSetting gameSetting = GameSetting.getInstance();
                            gameSetting.setGameModes(gameMessage.getGameModes());
                            gameSetting.setGameProfiles(gameMessage.getGameProfiles());
                            mOptionMenu.setGroupVisible(R.id.adminMenu, true);
                            if(getCurrentFragment() instanceof WaitGameFragment){
                                startFragment(ChooseModeFragment.newInstance(0));
                            }
                        }
                    }
                    else if(gameMessage.getEvent_type().equals("returnHighScoreList")){
                        //TODO: aufräumen
                        View view = getLayoutInflater().inflate(R.layout.highscore_listview, null);
                        ListView highscoreListView =  (ListView)view.findViewById(R.id.highscore_entry);
                        highscoreListView.setAdapter(new HighscoreListAdapter(gameMessage.getHighScoreList(), mContext));
                        MaterialDialog highscoreDialog = new MaterialDialog.Builder(mContext)
                                .title(R.string.high_score)
                                .customView(view, false)
                                .build();
                        highscoreDialog.setCanceledOnTouchOutside(false);
                        highscoreDialog.show();
                    }

                }
                else{
                    return;
                }
            }
        };

        //register CastConsumerImpl to CastManager
        sCastManager.addDataCastConsumer(sCastManagerConsumer);

        //Start Game
        if(mUser.isAdmin()){
            startFragment(ChooseModeFragment.newInstance(0));
        }
        else{
            startFragment(new WaitGameFragment());
        }


    }

    @Override
    public void onBackPressed(){
        //double click back button to exit
        if (doubleBackToExitPressedOnce) {
            super.onBackPressed();
            clearFragmentBackStack();
            //close the app completely! so that the connection is disabled.
            //if the user exit the game manually, then the connection will be closed
            sCastManager.disconnect();
//            this.finish();
        }
        doubleBackToExitPressedOnce = true;
        Toast.makeText(getApplicationContext(), "Please click BACK again to exit", Toast.LENGTH_SHORT).show();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                doubleBackToExitPressedOnce = false;
            }
        }, 2000);
    }

    @Override
    protected void onResume() {
        //sCastManager.addDataCastConsumer(sCastManagerConsumer);
        super.onResume();
    }

    @Override
    protected void onPause() {
        //sCastManager.removeDataCastConsumer(sCastManagerConsumer);
        super.onPause();
    }

    @Override
    public void onDestroy() {
        sCastManager.removeDataCastConsumer(sCastManagerConsumer);
        //TODO: clear User admin
        //TODO: GameManager - restartGame - resetAll!!!
        //User.resetInstance();
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.menu_main, menu);
        mOptionMenu = menu;

        sCastManager.addMediaRouterButton(menu,
                R.id.media_route_menu_item);

        //TODO make a method called HideOptionMenu
        if(mUser.isAdmin()){
            menu.setGroupVisible(R.id.adminMenu, true);
        }

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle presses on the action bar items
        switch (item.getItemId()) {

            case R.id.request_high_score_list:
                //TODO:  EventTransitionMngr: request HighScoreList!!!
                try {
                    GameMessage gameMessage = new GameMessage();
                    gameMessage.setEvent_type("requestHighScoreList");
                    sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.userChannel));
                }
                catch (Exception e) {
                }
                return true;
            case R.id.toggleConsole:
                if(mUser.isAdmin()){
                    if (!item.isChecked()) {
                        item.setChecked(true);
                        //TODO use the Class/Object to send the json string!!!
                        //TODO SendDataMessageToAdminChannel!
                        try{
                            sCastManager.sendDataMessage("{\"event_type\": \"hideConsole\", \"hide\": false }", getString(R.string.adminChannel));
                        }
                        catch (Exception e){
                            Log.d(TAG, "Send Message to AdminChannel failed");
                        }
                    }
                    else{
                        item.setChecked(false);

                        //TODO use the Class/Object to send the json string!!!
                        //TODO SendDataMessageToAdminChannel!
                        try{
                            sCastManager.sendDataMessage("{\"event_type\": \"hideConsole\", \"hide\": true }", getString(R.string.adminChannel));
                        }
                        catch (Exception e){
                            Log.d(TAG, "Send Message to AdminChannel failed");
                        }

                    }
                }
                return true;
            case R.id.restartApp:
                //TODO use the Class/Object to send the json string!!!
                //TODO SendDataMessageToAdminChannel!
                try{
                    sCastManager.sendDataMessage("{\"event_type\": \"restart\"}", getString(R.string.adminChannel));
                }
                catch (Exception e){
                    Log.d(TAG, "Send Message to AdminChannel failed");
                }
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    public void startFragment(Fragment fragment){
        getFragmentManager()
                .beginTransaction()
                .setCustomAnimations(R.animator.fragment_fade_enter , R.animator.fragment_fade_exit)
                .replace(R.id.main_page_container, fragment)
//                .addToBackStack(null)
//                .commit();
                //instead of commit for avoiding the "after onSaveInstanceState" problem
                .commitAllowingStateLoss();
    }

    public Fragment getCurrentFragment(){
        Fragment f = getFragmentManager().findFragmentById(R.id.main_page_container);
        return f;
    }

    public void clearFragmentBackStack(){
        getFragmentManager().popBackStack(null, FragmentManager.POP_BACK_STACK_INCLUSIVE);
    }

    public static DataCastManager getCastManager() {
        if (sCastManager == null) {
            throw new IllegalStateException("Application has not been started");
        }
        return sCastManager;
    }



}
