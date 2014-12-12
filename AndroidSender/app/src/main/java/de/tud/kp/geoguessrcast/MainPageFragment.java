package de.tud.kp.geoguessrcast;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.app.Fragment;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import org.json.JSONException;
import org.json.JSONObject;

import de.tud.kp.geoguessrcast.beans.User;

/**
 * Created by Kaijun on 02/12/14.
 */
public class MainPageFragment extends Fragment {

    MainActivity mActivity;

    public MainPageFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_main_page, container, false);
    }

    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mActivity = (MainActivity)getActivity();

        final EditText playernameEditText = (EditText) mActivity.findViewById(R.id.playername);
        playernameEditText.setText(getDeviceUsername(getActivity()));

        Button startBtn = (Button) mActivity.findViewById(R.id.startbtn);
        startBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if(mActivity.mApiClient!=null){

                    String userName = playernameEditText.getText().toString();
                    String userMac = getDeviceMacAddr(mActivity);
                    User user = new User(userName, userMac);
                    mActivity.sendMessage(mActivity.mUserChannel, user.toJSONString());
                    Log.d(mActivity.TAG, user.toJSONString());
                }
                else{
                    Log.d(mActivity.TAG, "plz connect the Chrome Cast at first");

                }
            }
        });
    }

    /**
     * get username of this android device
     */
    private String getDeviceUsername(Context context){
        AccountManager accountManager = AccountManager.get(context);
        Account[] accounts = accountManager.getAccountsByType("com.google");
        String email= accounts[0].name;
        String name = email.split("@")[0];
        return name;
    }
    /**
     * get Mac Address of this android device
     */
    private String getDeviceMacAddr(Context context){
        WifiManager manager = (WifiManager) mActivity.getSystemService(Context.WIFI_SERVICE);
        WifiInfo info = manager.getConnectionInfo();
        String macAddr = info.getMacAddress();
        return macAddr;
    }


}
