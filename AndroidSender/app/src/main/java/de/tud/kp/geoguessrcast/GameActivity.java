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
//import android.support.v4.app.FragmentManager;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ListView;
import android.widget.TabHost;
import android.widget.Toast;

import com.afollestad.materialdialogs.MaterialDialog;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.games.Game;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;
import com.google.sample.castcompanionlibrary.cast.callbacks.DataCastConsumerImpl;

import de.tud.kp.geoguessrcast.adapters.HighscoreListAdapter;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.fragments.ChooseHardnessAndCountryFragment;
import de.tud.kp.geoguessrcast.fragments.ChooseModeFragment;
import de.tud.kp.geoguessrcast.fragments.ChooseProfileFragment;
import de.tud.kp.geoguessrcast.fragments.CustomizeProfileFragment;
import de.tud.kp.geoguessrcast.fragments.FreeChoiceModeFragment;
import de.tud.kp.geoguessrcast.fragments.MultipleChoiceModeFragment;
import de.tud.kp.geoguessrcast.fragments.PointingModeFragment;
import de.tud.kp.geoguessrcast.fragments.WaitGameFragment;
import de.tud.kp.geoguessrcast.managers.GameManager;
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
    private GameActivity mContext;

    private GameManager mGameManager;
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

        mGameManager = new GameManager(this);


        //set EventListener for DataCastManager
        sCastManagerConsumer = new DataCastConsumerImpl(){
            @Override
            public void onDisconnected(){
                mGameManager.restartGame(mContext);
            }
            @Override
            public void onMessageReceived(CastDevice castDevice, String namespace, String message) {
                if (namespace.equals(getString(R.string.adminChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    if(gameMessage.getEvent_type().equals("restart")){
                        mGameManager.restartGame(mContext);
                    }
                    Log.d(TAG, "onMessageReceived from AdminChannel: " + message);
                }
                else if (namespace.equals(getString(R.string.gameChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    if(gameMessage.getEvent_type().equals("startGame")){
                        if(gameMessage.isStarted()){
                            int roundNumber = gameMessage.getRoundNumber();
                            int timeRound = gameMessage.getTimerRound();
                            int maxRounds = gameMessage.getMaxRounds();
                            mProfileBarMgr.updateRound(roundNumber, maxRounds);
                            mProfileBarMgr.initPointInfo();
                            if(gameMessage.isMultipleChoiceMode()){
                                String[] choices = gameMessage.getChoices();
                                mGameManager.startMultipleChoiceMode(mContext, roundNumber, timeRound, choices);
                            }
                            else if(gameMessage.isPointingMode()){
                                double[] defaultBounds = gameMessage.getBounds();
                                String mapType = gameMessage.getMapTypeTemplate();
                                mGameManager.startPointingMode(mContext, defaultBounds, mapType, roundNumber, timeRound);
                            }
                            else{
                                mGameManager.startFreeChoiceMode(mContext, roundNumber, timeRound);
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

                            mGameManager.requestHighScore();
                            mGameManager.startNewRound(mContext);
                        }
                    }
                    Log.d(TAG, "onMessageReceived from GameChannel: " + message);
                }
                else if (namespace.equals(getString(R.string.userChannel))){
                    GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                    if(gameMessage.getEvent_type().equals("answer_feedback")){
                        int pointsEarned = gameMessage.getPointsEarned();
                        mProfileBarMgr.updatePoint(pointsEarned);
                    }
                    else if(gameMessage.getEvent_type().equals("isAdmin")){
                        mUser.setColor(gameMessage.getUser_color());
                        if(gameMessage.isAdmin()==true){
                            //TODO: admin setup ()...
                            mGameManager.setupAdmin(gameMessage.getGameModes(), gameMessage.getGameProfiles(), gameMessage.getCountries());
                            Log.d("Color 4"+TAG, mUser.getColor());
                            mOptionMenu.setGroupVisible(R.id.adminMenu, true);
                            if(getCurrentFragment() instanceof WaitGameFragment){
                                startFragment(ChooseModeFragment.newInstance(0));
                            }
                        }
                    }
                    else if(gameMessage.getEvent_type().equals("returnHighScoreList")){
                        //TODO: aufräumen


                        View view = getLayoutInflater().inflate(R.layout.highscore_listview, null);
                        TabHost highscoreTabs =  (TabHost)view.findViewById(R.id.highscore_tabhost);
                        ListView highscoreListView =  (ListView)view.findViewById(R.id.global_highscore_entry);
                        highscoreListView.setAdapter(new HighscoreListAdapter(gameMessage.getHighScoreList(), mContext));
                        ListView localHighscoreListView =  (ListView)view.findViewById(R.id.local_highscore_entry);
                        localHighscoreListView.setAdapter(new HighscoreListAdapter(gameMessage.getLocalHighScoreList(), mContext));


                        highscoreTabs.setup();

                        TabHost.TabSpec tabpage1 = highscoreTabs.newTabSpec("Session Score");
                        tabpage1.setContent(R.id.local_highscore_entry);
                        tabpage1.setIndicator("Session Score");

                        TabHost.TabSpec tabpage2 = highscoreTabs.newTabSpec("All-time Score");
                        tabpage2.setContent(R.id.global_highscore_entry);
                        tabpage2.setIndicator("All-time Score");

                        highscoreTabs.addTab(tabpage1);
                        highscoreTabs.addTab(tabpage2);

                        MaterialDialog highscoreDialog = new MaterialDialog.Builder(mContext)
                                .negativeText(R.string.close)
                                .callback(new MaterialDialog.ButtonCallback() {
                                    @Override
                                    public void onNegative(MaterialDialog dialog) {
                                        super.onNegative(dialog);
                                        dialog.dismiss();
                                    }
                                })
                                .customView(view, false)
                                .build();

                        highscoreDialog.setCanceledOnTouchOutside(false);
                        highscoreDialog.show();
                    }
                    Log.d(TAG, "onMessageReceived from UserChannel: " + message);
                }
                else{
                    return;
                }

            }
        };

        //register CastConsumerImpl to CastManager
        sCastManager.addDataCastConsumer(sCastManagerConsumer);

        //Start Game
        mGameManager.startGame(mContext);

        //If the startGame Event already received in WelcomeActivity, but the Listeners for events are not registered...
        //then the latejoined User will not join the game...
        //TODO: need to find a better approach
        if(User.getInstance().persistedStartGameMsg!=null){
            User.PersistedStartGameMsg persistedStartGameMsg = User.getInstance().persistedStartGameMsg;
            int roundNumber = persistedStartGameMsg.roundNumber;
            int timeRound = persistedStartGameMsg.timeRound;
            int maxRounds = persistedStartGameMsg.maxRounds;
            System.out.println(maxRounds);
            mProfileBarMgr.updateRound(roundNumber, maxRounds);
            mProfileBarMgr.initPointInfo();
            if(persistedStartGameMsg.isMultipleChoiceMode){
                String[] choices = persistedStartGameMsg.choices;
                mGameManager.startMultipleChoiceMode(mContext, roundNumber, timeRound, choices);
            }
            else if(persistedStartGameMsg.isPointingMode){
                double[] defaultBounds = persistedStartGameMsg.defaultBounds;
                String mapType = persistedStartGameMsg.mapType;
                mGameManager.startPointingMode(mContext, defaultBounds, mapType, roundNumber, timeRound);
            }
            else{
                mGameManager.startFreeChoiceMode(mContext, roundNumber, timeRound);
            }
        }

    }

    @Override
    public void onBackPressed(){
        if(getCurrentFragment() instanceof ChooseProfileFragment || getCurrentFragment() instanceof CustomizeProfileFragment|| getCurrentFragment() instanceof ChooseHardnessAndCountryFragment){
            getFragmentManager().popBackStack();
            return;
        }

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

            //if there's back button on the actionbar.
            case android.R.id.home:
                this.onBackPressed();
                return true;

            case R.id.request_high_score_list:
                mGameManager.requestHighScore();
                return true;
            case R.id.toggleConsole:
                if(mUser.isAdmin()){
                    if (!item.isChecked()) {
                        item.setChecked(true);
                        mGameManager.requestHideConsole(false);
                    }
                    else{
                        item.setChecked(false);
                        mGameManager.requestHideConsole(true);
                    }
                }
                return true;
            case R.id.restartApp:
                mGameManager.requestRestart();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    public void startFragment(Fragment fragment){
        if(fragment instanceof ChooseProfileFragment || fragment instanceof CustomizeProfileFragment|| fragment instanceof ChooseHardnessAndCountryFragment){
            getFragmentManager()
                .beginTransaction()
                .setCustomAnimations(R.animator.fragment_fade_enter, R.animator.fragment_fade_exit)
                .replace(R.id.main_page_container, fragment)
                .addToBackStack(null)
                .commitAllowingStateLoss();
        }
        else{
            getFragmentManager()
                    .beginTransaction()
                    .setCustomAnimations(R.animator.fragment_fade_enter , R.animator.fragment_fade_exit)
                    .replace(R.id.main_page_container, fragment)
//                .addToBackStack(null)
//                .commit();
                    //instead of commit for avoiding the "after onSaveInstanceState" problem
                    .commitAllowingStateLoss();
        }
    }

    public Fragment getCurrentFragment(){
        Fragment f = getFragmentManager().findFragmentById(R.id.main_page_container);
        return f;
    }

    public void clearFragmentBackStack(){
//        getFragmentManager().popBackStack(null, FragmentManager.POP_BACK_STACK_INCLUSIVE);
    }

    public static DataCastManager getCastManager() {
        if (sCastManager == null) {
            throw new IllegalStateException("Application has not been started");
        }
        return sCastManager;
    }

    public GameManager getGameManager() {
        if (mGameManager == null) {
            throw new IllegalStateException("Application has not been started");
        }
        return mGameManager;
    }



}
