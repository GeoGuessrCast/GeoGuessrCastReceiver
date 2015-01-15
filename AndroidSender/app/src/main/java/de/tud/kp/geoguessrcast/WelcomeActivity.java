package de.tud.kp.geoguessrcast;

import android.content.Context;
import android.content.Intent;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.app.MediaRouteButton;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.CastDevice;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;
import com.google.sample.castcompanionlibrary.cast.callbacks.DataCastConsumerImpl;

import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.DeviceInfo;
import de.tud.kp.geoguessrcast.utilities.Utility;


public class WelcomeActivity extends ActionBarActivity {

    private static DataCastManager sCastManager;
    private static DataCastConsumerImpl sCastManagerConsumer;
    private Context mContext;
    private User mUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_welcome);
        mContext = this;

        initializeCastManager();

        final MediaRouteButton mediaRouteButton = (MediaRouteButton) findViewById(R.id.media_route_button);
        sCastManager.addMediaRouterButton(mediaRouteButton);

        final EditText usernameEditText = (EditText) findViewById(R.id.playername);
        final Button startGameBtn = (Button) findViewById(R.id.start_game);
        startGameBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Utility.hideSoftKeyboard(WelcomeActivity.this);
                if(!sCastManager.isConnected()){
                    mediaRouteButton.performClick();
                }
                else{
                    //TODO: GameManager - StartGame
                    try {
                        String userName = usernameEditText.getText().toString();
                        String userMac = DeviceInfo.getDeviceMacAddr(mContext);
                        mUser = User.newInstance(userName, userMac);
                        sCastManager.sendDataMessage(mUser.toJSONString(), getString(R.string.userChannel));
                    } catch (Exception e) {
                        Log.e("Error", "Exception while sending message", e);
                    }
                }
            }
        });

        usernameEditText.setText(DeviceInfo.getDeviceUsername(mContext));
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

        sCastManagerConsumer = new DataCastConsumerImpl(){

            @Override
            public void onDeviceSelected(CastDevice device) {
                startGameBtn.setEnabled(false);
            }

            @Override
            public void onApplicationConnected(ApplicationMetadata appMetadata, String applicationStatus,
                                               String sessionId, boolean wasLaunched) {
                //TODO: GameManager - StartGame
                try {
                    String userName = usernameEditText.getText().toString();
                    String userMac = DeviceInfo.getDeviceMacAddr(mContext);
                    mUser = User.newInstance(userName, userMac);
                    sCastManager.sendDataMessage(mUser.toJSONString(), getString(R.string.userChannel));
                } catch (Exception e) {
                    Log.e("Error", "Exception while sending message", e);
                }


                startGameBtn.setEnabled(true);
            }

            @Override
            public void onMessageReceived(CastDevice castDevice, String namespace, String message) {
                if (namespace.equals(getString(R.string.userChannel))){
                    if(message.equals("true")){
                        mUser.setAdmin(true);
                        Intent intent = new Intent(WelcomeActivity.this, GameActivity.class);
                        WelcomeActivity.this.startActivity(intent);
                    }
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

    @Override
    public void onPause(){
        sCastManager.removeDataCastConsumer(sCastManagerConsumer);
        super.onPause();
    }

    @Override
    public void onResume(){
        sCastManager.addDataCastConsumer(sCastManagerConsumer);
        super.onResume();
    }

    @Override
    public void onDestroy(){
        sCastManager.disconnect();
        super.onPause();
    }

}
