package de.tud.kp.geoguessrcast;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.drawable.AnimationDrawable;
import android.graphics.drawable.Drawable;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.app.MediaRouteButton;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.animation.RotateAnimation;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.CastDevice;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;
import com.google.sample.castcompanionlibrary.cast.callbacks.DataCastConsumerImpl;

import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.DeviceInfo;
import de.tud.kp.geoguessrcast.utilities.Utility;


public class WelcomeActivity extends ActionBarActivity {

    public static final String TAG = WelcomeActivity.class.getSimpleName();
    private static DataCastManager sCastManager;
    private static DataCastConsumerImpl sCastManagerConsumer;
    private Context mContext;
    private User mUser;
    public static final String GAME_PREFS = "GamePreference";
    private static final String USER_NAME_STORED = "UserNameStored";
    private static final long RECONNECT_TIMEOUT = 10;
    private Thread mConnectionCheckThread;

    EditText usernameEditText;
    FloatingActionButton startGameBtn;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_welcome);
        mContext = this;

        // Restore preferences
        SharedPreferences settings = getSharedPreferences(GAME_PREFS, MODE_PRIVATE);

        initializeCastManager();

        final MediaRouteButton mediaRouteButton = (MediaRouteButton) findViewById(R.id.media_route_button);
        sCastManager.addMediaRouterButton(mediaRouteButton);

        usernameEditText = (EditText) findViewById(R.id.playername);
        startGameBtn = (FloatingActionButton) findViewById(R.id.start_game);

        //check if username stored
        //show default Username in editText
        String storedUsername = settings.getString(USER_NAME_STORED, null);
        if(storedUsername != null && !storedUsername.isEmpty()){
            usernameEditText.setText(storedUsername);
        }
        else{
            usernameEditText.setText(DeviceInfo.getDeviceUsername(mContext));
        }

        //set cursor at the end of text
        usernameEditText.setSelection(usernameEditText.getText().length());
        //set enter key event listener
        usernameEditText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                boolean handled = false;
                if (actionId == EditorInfo.IME_ACTION_GO) {
                    startGameBtn.performClick();
                    handled = true;
                }
                return handled;
            }
        });

        startGameBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Utility.hideSoftKeyboard(WelcomeActivity.this);
                if(usernameEditText.getText().toString().isEmpty()){
                    Toast.makeText(getApplicationContext(), getString(R.string.username_empty_tip), Toast.LENGTH_LONG).show();
                }
                else{
                    if(!sCastManager.isConnected()){
                        mediaRouteButton.performClick();
                    }
                    else{
                        //TODO: GameManager - StartGame
                        try {
                            String userName = usernameEditText.getText().toString();
                            String userMac = DeviceInfo.getDeviceMacAddr(mContext);
                            mUser = User.getInstance();
                            mUser.setUserName(userName);
                            mUser.setUserMac(userMac);
                            storeUsername(userName);
                            sCastManager.sendDataMessage(mUser.toJSONString(), getString(R.string.userChannel));
                        } catch (Exception e) {
                            Log.e("Error", "Exception while sending message", e);
                        }
                    }
                }

            }
        });



        sCastManagerConsumer = new DataCastConsumerImpl(){

            @Override
            public void onDeviceSelected(CastDevice device) {

                updateStartBtn();

            }

            @Override
            public void onApplicationConnected(ApplicationMetadata appMetadata, String applicationStatus,
                                               String sessionId, boolean wasLaunched) {

                updateStartBtn();

                //TODO: GameManager - StartGame
                try {
                    String userName = usernameEditText.getText().toString();
                    String userMac = DeviceInfo.getDeviceMacAddr(mContext);
                    mUser = User.getInstance();
                    mUser.setUserName(userName);
                    mUser.setUserMac(userMac);
                    storeUsername(userName);
                    sCastManager.sendDataMessage(mUser.toJSONString(), getString(R.string.userChannel));
                } catch (Exception e) {
                    Log.e("Error", "Exception while sending message", e);
                }
            }
            @Override
            public boolean onApplicationConnectionFailed(int errorCode){
                Toast.makeText(getApplicationContext(), getString(R.string.connect_failed_info), Toast.LENGTH_LONG).show();
                //call internal disconnect due to the bug of chromecast->isDisconnected and isConnected the both are false
                sCastManager.disconnectDevice(false, true, true);

                updateStartBtn();

                return false;
            }

            @Override
            public void onDisconnected(){
                updateStartBtn();
            }

            @Override
            public void onMessageReceived(CastDevice castDevice, String namespace, String message) {
                GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
                if (namespace.equals(getString(R.string.userChannel))){
                    if(gameMessage.getEvent_type().equals("isAdmin")){
                        mUser.setColor(gameMessage.getUser_color());
                        if(gameMessage.isAdmin()==true){
                            mUser.setAdmin(true);
                            GameSetting gameSetting = GameSetting.getInstance();
                            gameSetting.setGameModes(gameMessage.getGameModes());
                            gameSetting.setGameProfiles(gameMessage.getGameProfiles());
                            gameSetting.setCountries(gameMessage.getCountries());
                            Intent intent = new Intent(WelcomeActivity.this, GameActivity.class);
                            startActivity(intent);
                        }
                        else{
                            mUser.setAdmin(false);
                            Intent intent = new Intent(WelcomeActivity.this, GameActivity.class);
                            startActivity(intent);
                        }
                    }
                    Log.d(TAG, "onMessageReceived from UserChannel: " + message);
                }
                else if(namespace.equals(getString(R.string.gameChannel))){
                    if(gameMessage.getEvent_type().equals("startGame")){
                        if(gameMessage.isStarted()){
                            User.getInstance().persistedStartGameMsg = new User.PersistedStartGameMsg();
                            User.getInstance().persistedStartGameMsg.roundNumber = gameMessage.getRoundNumber();
                            User.getInstance().persistedStartGameMsg.timeRound = gameMessage.getTimerRound();
                            User.getInstance().persistedStartGameMsg.maxRounds = gameMessage.getMaxRounds();
                            if(gameMessage.isMultipleChoiceMode()){
                                User.getInstance().persistedStartGameMsg.isMultipleChoiceMode = true;
                                User.getInstance().persistedStartGameMsg.choices = gameMessage.getChoices();
                            }
                            else if(gameMessage.isPointingMode()){
                                User.getInstance().persistedStartGameMsg.isPointingMode = true;
                                User.getInstance().persistedStartGameMsg.defaultBounds = gameMessage.getBounds();
                                User.getInstance().persistedStartGameMsg.mapType = gameMessage.getMapTypeTemplate();
                            }
                        }
                    }

                    Log.d(TAG, "onMessageReceived from GameChannel: " + message);
                }
            }
        };

        sCastManager.addDataCastConsumer(sCastManagerConsumer);

    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_welcome, menu);
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

            case R.id.start_about:
                Intent intent = new Intent(WelcomeActivity.this, AboutActivity.class);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void initializeCastManager() {
        sCastManager = DataCastManager.initialize(getApplicationContext(), getString(R.string.app_id),
                getString(R.string.adminChannel), getString(R.string.userChannel), getString(R.string.gameChannel));
        sCastManager.enableFeatures(
                DataCastManager.FEATURE_NOTIFICATION |
                        DataCastManager.FEATURE_LOCKSCREEN |
                        DataCastManager.FEATURE_WIFI_RECONNECT |
                        DataCastManager.FEATURE_CAPTIONS_PREFERENCE |
                        DataCastManager.FEATURE_DEBUGGING);

    }

    public static DataCastManager getCastManager() {
        if (sCastManager == null) {
            throw new IllegalStateException("Application has not been started");
        }
        return sCastManager;
    }

    private void storeUsername(String username){
        SharedPreferences settings = getSharedPreferences(GAME_PREFS, MODE_PRIVATE);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(USER_NAME_STORED, username);
        editor.commit();
    }

    @Override
    public void onPause(){
        sCastManager.removeDataCastConsumer(sCastManagerConsumer);
        super.onPause();
    }

    @Override
    public void onResume(){
        sCastManager.addDataCastConsumer(sCastManagerConsumer);

//        TODO: initStartBtnState()
        final FloatingActionButton startGameBtn = (FloatingActionButton) findViewById(R.id.start_game);
        if(sCastManager.isConnected()){
            startGameBtn.setIcon(R.drawable.ic_play_arrow_white_48dp);
        }
        else{
            startGameBtn.setIcon(R.drawable.ic_cast_white_48dp);
        }
        startGameBtn.setEnabled(true);

        super.onResume();
    }

    @Override
    public void onDestroy(){
        sCastManager.disconnect();
        User.resetInstance();
        super.onPause();
    }

    @Override
    public void onStop(){
        super.onStop();

        if(mConnectionCheckThread!=null){
            mConnectionCheckThread.interrupt();
            mConnectionCheckThread=null;
        }
    }

    private void updateStartBtn(){
        if(!sCastManager.isConnected()){
            startGameBtn.setIcon(R.drawable.ic_cast_white_48dp);
            startGameBtn.setEnabled(true);
        }
        if(sCastManager.isConnected()){
            startGameBtn.setIcon(R.drawable.ic_play_arrow_white_48dp);
            startGameBtn.setEnabled(true);
        }
        if(sCastManager.isConnecting()){
            startGameBtn.setIcon(R.drawable.ic_refresh_white_48dp);
            startGameBtn.setEnabled(false);
        }
    }

}
