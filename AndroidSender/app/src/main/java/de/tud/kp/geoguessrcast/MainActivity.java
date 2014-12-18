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

import java.io.IOException;
import java.util.ArrayList;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Handler;
import android.speech.RecognizerIntent;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.support.v7.media.MediaRouter.RouteInfo;
import android.support.v7.widget.PopupMenu;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.Cast.ApplicationConnectionResult;
import com.google.android.gms.cast.Cast.MessageReceivedCallback;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.beans.eventJsonBeans.GameMessage;

/**
 * Main activity to send messages to the receiver.
 */
public class MainActivity extends ActionBarActivity {

    public static final String TAG = MainActivity.class.getSimpleName();

    private static final int REQUEST_CODE = 1;

    private MediaRouter mMediaRouter;
    private MediaRouteSelector mMediaRouteSelector;
    private MediaRouter.Callback mMediaRouterCallback;
    private CastDevice mSelectedDevice;
    public GoogleApiClient mApiClient;
    private Cast.Listener mCastListener;
    private ConnectionCallbacks mConnectionCallbacks;
    private ConnectionFailedListener mConnectionFailedListener;
    public HelloWorldChannel mHelloWorldChannel;
    public UserChannel mUserChannel;
    public AdminChannel mAdminChannel;
    public GameChannel mGameChannel;
    private boolean mApplicationStarted;
    private boolean mWaitingForReconnect;
    private String mSessionId;
    private boolean doubleBackToExitPressedOnce;
    public User user;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //init main page fragment
        getFragmentManager()
                .beginTransaction()
                .setCustomAnimations(R.animator.fragment_fade_enter , R.animator.fragment_fade_exit)
                .add(R.id.main_page_container, new MainPageFragment())
                .commit();

//        startFragment(new MainPageFragment());

        // Configure Cast device discovery
        mMediaRouter = MediaRouter.getInstance(getApplicationContext());
        mMediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(
                        CastMediaControlIntent.categoryForCast(getResources()
                                .getString(R.string.app_id))).build();
        mMediaRouterCallback = new MyMediaRouterCallback();


    }

    @Override
    public void onBackPressed(){
        //double click back button to exit
        if (doubleBackToExitPressedOnce) {
            super.onBackPressed();
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
        super.onResume();
        // Start media router discovery
        mMediaRouter.addCallback(mMediaRouteSelector, mMediaRouterCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
    }

    @Override
    protected void onPause() {
        if (isFinishing()) {
            // End media router discovery
            mMediaRouter.removeCallback(mMediaRouterCallback);
        }
        super.onPause();
    }

    @Override
    public void onDestroy() {
        teardown();
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.menu_main, menu);
        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider = (MediaRouteActionProvider) MenuItemCompat
                .getActionProvider(mediaRouteMenuItem);
        // Set the MediaRouteActionProvider selector for device discovery.
        mediaRouteActionProvider.setRouteSelector(mMediaRouteSelector);
        return true;
    }

    /**
     * Callback for MediaRouter events
     */
    private class MyMediaRouterCallback extends MediaRouter.Callback {

        @Override
        public void onRouteSelected(MediaRouter router, RouteInfo info) {
            Log.d(TAG, "onRouteSelected");
            // Handle the user route selection.
            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());

            launchReceiver();
        }

        @Override
        public void onRouteUnselected(MediaRouter router, RouteInfo info) {
            Log.d(TAG, "onRouteUnselected: info=" + info);
            teardown();
            mSelectedDevice = null;
        }
    }

    /**
     * Start the receiver app
     */
    private void launchReceiver() {
        try {
            mCastListener = new Cast.Listener() {

                @Override
                public void onApplicationDisconnected(int errorCode) {
                    Log.d(TAG, "application has stopped");
                    teardown();
                }

            };
            // Connect to Google Play services
            mConnectionCallbacks = new ConnectionCallbacks();
            mConnectionFailedListener = new ConnectionFailedListener();
            Cast.CastOptions.Builder apiOptionsBuilder = Cast.CastOptions
                    .builder(mSelectedDevice, mCastListener);
            mApiClient = new GoogleApiClient.Builder(this)
                    .addApi(Cast.API, apiOptionsBuilder.build())
                    .addConnectionCallbacks(mConnectionCallbacks)
                    .addOnConnectionFailedListener(mConnectionFailedListener)
                    .build();

            mApiClient.connect();
        } catch (Exception e) {
            Log.e(TAG, "Failed launchReceiver", e);
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionCallbacks implements
            GoogleApiClient.ConnectionCallbacks {
        @Override
        public void onConnected(Bundle connectionHint) {
            Log.d(TAG, "onConnected");

            if (mApiClient == null) {
                // We got disconnected while this runnable was pending
                // execution.
                return;
            }

            try {
                if (mWaitingForReconnect) {
                    mWaitingForReconnect = false;

                    // Check if the receiver app is still running
                    if ((connectionHint != null)
                            && connectionHint
                            .getBoolean(Cast.EXTRA_APP_NO_LONGER_RUNNING)) {
                        Log.d(TAG, "App  is no longer running");
                        teardown();
                    } else {
                        // Re-create the custom message channel
                        try {
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mUserChannel.getNamespace(),
                                    mUserChannel);
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mAdminChannel.getNamespace(),
                                    mAdminChannel);
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mGameChannel.getNamespace(),
                                    mGameChannel);
                        } catch (IOException e) {
                            Log.e(TAG, "Exception while creating channel", e);
                        }
                    }
                } else {
                    // Launch the receiver app
                    Cast.CastApi
                            .launchApplication(mApiClient,
                                    getString(R.string.app_id), false)
                            .setResultCallback(
                                    new ResultCallback<Cast.ApplicationConnectionResult>() {
                                        @Override
                                        public void onResult(
                                                ApplicationConnectionResult result) {
                                            Status status = result.getStatus();
                                            Log.d(TAG,
                                                    "ApplicationConnectionResultCallback.onResult: statusCode"
                                                            + status.getStatusCode());
                                            if (status.isSuccess()) {
                                                ApplicationMetadata applicationMetadata = result
                                                        .getApplicationMetadata();
                                                mSessionId = result
                                                        .getSessionId();
                                                String applicationStatus = result
                                                        .getApplicationStatus();
                                                boolean wasLaunched = result
                                                        .getWasLaunched();
                                                Log.d(TAG,
                                                        "application name: "
                                                                + applicationMetadata
                                                                .getName()
                                                                + ", status: "
                                                                + applicationStatus
                                                                + ", sessionId: "
                                                                + mSessionId
                                                                + ", wasLaunched: "
                                                                + wasLaunched);
                                                mApplicationStarted = true;

                                                // Create the custom message
                                                // channel
                                                mHelloWorldChannel = new HelloWorldChannel();
                                                mUserChannel = new UserChannel();
                                                mAdminChannel = new AdminChannel();
                                                mGameChannel = new GameChannel();
                                                try {

                                                    Cast.CastApi
                                                            .setMessageReceivedCallbacks(
                                                                    mApiClient,
                                                                    mUserChannel
                                                                            .getNamespace(),
                                                                    mUserChannel);

                                                    Cast.CastApi
                                                            .setMessageReceivedCallbacks(
                                                                    mApiClient,
                                                                    mAdminChannel
                                                                            .getNamespace(),
                                                                    mAdminChannel);
                                                    Cast.CastApi
                                                            .setMessageReceivedCallbacks(
                                                                    mApiClient,
                                                                    mGameChannel
                                                                            .getNamespace(),
                                                                    mGameChannel);

                                                } catch (IOException e) {
                                                    Log.e(TAG,
                                                            "Exception while creating channel",
                                                            e);
                                                }

                                                // set the initial instructions
                                                // on the receiver
//                                                sendMessage(getString(R.string.instructions));
                                            } else {
                                                Log.e(TAG,
                                                        "application could not launch");
                                                teardown();
                                            }
                                        }
                                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to launch application", e);
            }
        }

        @Override
        public void onConnectionSuspended(int cause) {
            Log.d(TAG, "onConnectionSuspended");
            mWaitingForReconnect = true;
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionFailedListener implements
            GoogleApiClient.OnConnectionFailedListener {
        @Override
        public void onConnectionFailed(ConnectionResult result) {
            Log.e(TAG, "onConnectionFailed ");

            teardown();
        }
    }

    /**
     * Tear down the connection to the receiver
     */
    private void teardown() {
        Log.d(TAG, "teardown");
        if (mApiClient != null) {
            if (mApplicationStarted) {
                if (mApiClient.isConnected()  || mApiClient.isConnecting()) {
                    try {
                        Cast.CastApi.stopApplication(mApiClient, mSessionId);
                        if (mUserChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mUserChannel.getNamespace());
                            mUserChannel = null;
                        }
                        if (mAdminChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mAdminChannel.getNamespace());
                            mAdminChannel = null;
                        }
                        if (mGameChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mGameChannel.getNamespace());
                            mGameChannel = null;
                        }
                    } catch (IOException e) {
                        Log.e(TAG, "Exception while removing channel", e);
                    }
                    mApiClient.disconnect();
                }
                mApplicationStarted = false;
            }
            mApiClient = null;
        }
        mSelectedDevice = null;
        mWaitingForReconnect = false;
        mSessionId = null;
    }

    /**
     * Send a text message to the receiver
     *
     * @param message
     */


    public void sendMessage(UserChannel channel, String message) {
        if (mApiClient != null && channel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        channel.getNamespace(), message)
                        .setResultCallback(new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
                                if (!result.isSuccess()) {
                                    Log.e(TAG, "Sending message failed");
                                }
                            }
                        });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT)
                    .show();
        }
    }

    public void sendMessage(AdminChannel channel, String message) {
        if (mApiClient != null && channel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        channel.getNamespace(), message)
                        .setResultCallback(new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
                                if (!result.isSuccess()) {
                                    Log.e(TAG, "Sending message failed");
                                }
                            }
                        });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT)
                    .show();
        }
    }

    public void sendMessage(GameChannel channel, String message) {
        if (mApiClient != null && channel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        channel.getNamespace(), message)
                        .setResultCallback(new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
                                if (!result.isSuccess()) {
                                    Log.e(TAG, "Sending message failed");
                                }
                            }
                        });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT)
                    .show();
        }
    }
    /**
     * Custom message channel
     */
    class HelloWorldChannel implements MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.namespace);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            Log.d(TAG, "onMessageReceived: " + message);
        }
    }

    class UserChannel implements MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.userChannel);
        }

        /*
         * Receive message from the receiver app
         * If the User is the game leader, then start ChooseModeFragment
         * else start WaitingFragment
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            if(message.equals("true")){
                user.setAdmin(true);
                startFragment(new ChooseModeFragment());
            }
            else{
                startFragment(new WaitingFragment());
            }
            Log.d(TAG, "onMessageReceived from UserChannel: " + message);
        }
    }

    class AdminChannel implements MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.adminChannel);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            Log.d(TAG, "onMessageReceived from AdminChannel: " + message);
        }
    }

    class GameChannel implements MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.gameChannel);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            Log.d(TAG, "onMessageReceived from GameChannel: " + message);

            GameMessage gameMessage = new Gson().fromJson(message, GameMessage.class);
            if(gameMessage.getEvent_type().equals("startGame")){
                if(gameMessage.getStarted().equals("true")){
                    //switch gameMode to start GameMode
                    if(gameMessage.getGameMode().equals("1"))
                        startFragment(new GameMode1Fragment());
                }
            }
            else if(gameMessage.getEvent_type().equals("gameDetail")){

            }

        }
    }

    public void startFragment(Fragment fragment){
        getFragmentManager()
                .beginTransaction()
                .setCustomAnimations(R.animator.fragment_fade_enter , R.animator.fragment_fade_exit)
                .replace(R.id.main_page_container, fragment)
                .addToBackStack(null)
                .commit();
    }
}
