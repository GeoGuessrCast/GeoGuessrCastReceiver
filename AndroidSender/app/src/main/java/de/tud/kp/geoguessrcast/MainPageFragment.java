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
//                if(mActivity.mApiClient!=null){
                String playername = playernameEditText.getText().toString();
                JSONObject userData = new JSONObject();
                try {
                    userData.put("dataType", "userData").put("userName", playername).put("userMac", getDeviceMacAddr(mActivity));
                }catch (JSONException ex) {
                    throw new RuntimeException(ex);
                }
                mActivity.sendMessage(userData.toString());
                Log.d(mActivity.TAG, userData.toString());

                replaceOfChooseModeFragment();
//                }
//                else{
//                    Log.d(TAG, "plz connect the Chrome Cast at first");
//
//                }
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

    private void replaceOfWaitingFragment(){
        getFragmentManager()
                .beginTransaction()

                        // Replace the default fragment animations with animator resources representing
                        // rotations when switching to the back of the card, as well as animator
                        // resources representing rotations when flipping back to the front (e.g. when
                        // the system Back button is pressed).
                .setCustomAnimations(R.animator.fragment_slide_in , R.animator.fragment_slide_out)
                        // Replace any fragments currently in the container view with a fragment
                        // representing the next page (indicated by the just-incremented currentPage
                        // variable).
                .replace(R.id.main_page_container, new WaitingFragment())

                        // Add this transaction to the back stack, allowing users to press Back
                        // to get to the front of the card.
                .addToBackStack(null)

                        // Commit the transaction.
                .commit();
    }


    private void replaceOfChooseModeFragment(){
        getFragmentManager()
                .beginTransaction()

                        // Replace the default fragment animations with animator resources representing
                        // rotations when switching to the back of the card, as well as animator
                        // resources representing rotations when flipping back to the front (e.g. when
                        // the system Back button is pressed).
                .setCustomAnimations(R.animator.fragment_slide_in , R.animator.fragment_slide_out)

                        // Replace any fragments currently in the container view with a fragment
                        // representing the next page (indicated by the just-incremented currentPage
                        // variable).
                .replace(R.id.main_page_container, new ChooseModeFragment())

                        // Add this transaction to the back stack, allowing users to press Back
                        // to get to the front of the card.
                .addToBackStack(null)

                        // Commit the transaction.
                .commit();
    }
}
