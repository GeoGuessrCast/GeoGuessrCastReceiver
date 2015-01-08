package de.tud.kp.geoguessrcast;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.app.Fragment;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import de.tud.kp.geoguessrcast.beans.User;

/**
 * Created by Kaijun on 02/12/14.
 */
public class MainPageFragment extends Fragment {

    private MainActivity mActivity;
//    private boolean doubleBackToExitPressedOnce;

    public MainPageFragment() {
//        doubleBackToExitPressedOnce = false;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_main_page, container, false);
    }

    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mActivity = (MainActivity)getActivity();

        final EditText usernameEditText = (EditText) mActivity.findViewById(R.id.playername);
        final Button startBtn = (Button) mActivity.findViewById(R.id.startbtn);

        usernameEditText.setText(getDeviceUsername(getActivity()));
        usernameEditText.setOnKeyListener(new View.OnKeyListener(){
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (keyEvent.getAction() == KeyEvent.ACTION_DOWN)
                {
                    switch (i)
                    {
                        case KeyEvent.KEYCODE_ENTER:
                            startBtn.performClick();
                            return true;
                        default:
                            break;
                    }
                }
                return false;
            }
        });


        startBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if(mActivity.mApiClient!=null){
                    String userName = usernameEditText.getText().toString();
                    String userMac = getDeviceMacAddr();
                    mActivity.user = new User(userName, userMac);
                    mActivity.sendMessage(mActivity.mUserChannel, mActivity.user.toJSONString());
                    Log.d(mActivity.TAG, mActivity.user.toJSONString());
                }
                else{
                    Log.d(mActivity.TAG, "Please connect the Chrome Cast at first");

                }
            }
        });

//        // bind EventListener for back button
//        View fragmentView = this.getView();
//        fragmentView.setFocusableInTouchMode(true);
//        fragmentView.setOnKeyListener(new View.OnKeyListener() {
//            @Override
//            public boolean onKey(View view, int i, KeyEvent keyEvent) {
//                //Because OnKey bind both down/up Event, so this is the filter for up Event.
//                if (keyEvent.getAction()!=KeyEvent.ACTION_DOWN)
//                    return true;
//                if( i == KeyEvent.KEYCODE_BACK )
//                {
//                    //double click back button to exit
//                    if (doubleBackToExitPressedOnce) {
//                        mActivity.onBackPressed();
//                        return true;
//                    }
//                    doubleBackToExitPressedOnce = true;
//                    Toast.makeText(mActivity, "Please click BACK again to exit", Toast.LENGTH_SHORT).show();
//                    new Handler().postDelayed(new Runnable() {
//                        @Override
//                        public void run() {
//                            doubleBackToExitPressedOnce = false;
//                        }
//                    }, 2000);
//                    return true;
//                }
//                return false;
//            }
//        });
    }

    /**
     * get username of this android device
     */
    private String getDeviceUsername(Context context){
        AccountManager accountManager = AccountManager.get(context);
        Account[] accounts = accountManager.getAccountsByType("com.google");
        if(accounts.length>0){
            String email= accounts[0].name;
            String name = email.split("@")[0];
            return name;
        }
        return "";
    }
    /**
     * get Mac Address of this android device
     */
    private String getDeviceMacAddr(){
        WifiManager manager = (WifiManager) mActivity.getSystemService(Context.WIFI_SERVICE);
        WifiInfo info = manager.getConnectionInfo();
        String macAddr = info.getMacAddress();
        return macAddr;
    }


}
