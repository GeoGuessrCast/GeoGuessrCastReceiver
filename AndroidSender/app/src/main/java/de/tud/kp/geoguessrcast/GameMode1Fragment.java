package de.tud.kp.geoguessrcast;

import android.app.Fragment;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by Kaijun on 11/12/14.
 */

public class GameMode1Fragment extends Fragment {

    MainActivity mActivity;
    Timer timer = new Timer();

    public GameMode1Fragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_game_mode_1, container, false);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);
        mActivity = (MainActivity)getActivity();

        Button sendCityNameBtn = (Button) mActivity.findViewById(R.id.sendCityName);
        sendCityNameBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                final EditText cityNameEditText = (EditText) mActivity.findViewById(R.id.cityNameEditText);
                String cityNameJSON = "{\"type\":\"chosen\" , \"answer\":" + "\"" + cityNameEditText.getText().toString() +  "\""+ "}";
                Log.d(mActivity.TAG, cityNameJSON);
                mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
            }
        });

        final TextView timerTextView = (TextView) mActivity.findViewById(R.id.gameTimer);

        new CountDownTimer(10000, 1000) {
            public void onTick(long millisUntilFinished) {
                timerTextView.setText(String.valueOf(millisUntilFinished / 1000));
            }
            public void onFinish() {
                timerTextView.setText("done!");
                mActivity.startWaitingFragment();
            }
        }.start();
    }


}