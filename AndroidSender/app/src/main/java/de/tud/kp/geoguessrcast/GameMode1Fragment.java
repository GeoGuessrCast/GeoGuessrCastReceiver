package de.tud.kp.geoguessrcast;

import android.app.Fragment;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.google.gson.Gson;

import java.util.Timer;
import java.util.TimerTask;

import de.tud.kp.geoguessrcast.beans.eventJsonBeans.GameMessage;

/**
 * Created by Kaijun on 11/12/14.
 */

public class GameMode1Fragment extends Fragment {

    MainActivity mActivity;
    CountDownTimer timer;
    boolean isAnswerSendet;

    public GameMode1Fragment() {
        this.isAnswerSendet = false;
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

        final EditText cityNameEditText = (EditText) mActivity.findViewById(R.id.cityNameEditText);
        final Button sendCityNameBtn = (Button) mActivity.findViewById(R.id.sendCityName);

        sendCityNameBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"" + cityNameEditText.getText().toString() +  "\""+ ", \"userMac\":\"" + mActivity.user.getUserMac() + "\"}";
                mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
                isAnswerSendet = true;
                mActivity.startFragment(new WaitingFragment());

            }
        });

        cityNameEditText.setOnKeyListener(new View.OnKeyListener(){
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (keyEvent.getAction() == KeyEvent.ACTION_DOWN)
                {
                    switch (i)
                    {
                        case KeyEvent.KEYCODE_ENTER:
                            sendCityNameBtn.performClick();
                            return true;
                        default:
                            break;
                    }
                }
                return false;
            }
        });

        final TextView timerTextView = (TextView) mActivity.findViewById(R.id.gameTimer);
        timer = new CountDownTimer(30000, 1000) {
            public void onTick(long millisUntilFinished) {
                timerTextView.setText(String.valueOf(millisUntilFinished / 1000));
            }
            public void onFinish() {
                if(!isAnswerSendet){
                    timerTextView.setText("Round Ended!");
                    String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"\""+ ", \"userMac\":\"" + mActivity.user.getUserMac() + "\"}";
                    mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
                    mActivity.startFragment(new WaitingFragment());
                }
            }
        };
        timer.start();
    }

    @Override
    public void onPause(){
        resetTimer();
        super.onPause();
    }
    @Override
    public void onStop(){
        resetTimer();
        super.onStop();
    }
    @Override
    public void onDetach(){
        resetTimer();
        super.onDetach();
    }
    @Override
    public void onDestroy(){
        resetTimer();
        super.onDestroy();
    }

    private void resetTimer(){
        if(this.timer!=null){
            this.timer.cancel();
            this.timer = null;
        }
    }
}