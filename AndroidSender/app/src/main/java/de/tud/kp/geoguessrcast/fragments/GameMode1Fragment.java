package de.tud.kp.geoguessrcast.fragments;

import android.app.Fragment;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.TimerWithVibration;
import de.tud.kp.geoguessrcast.utilities.Utility;

/**
 * Created by Kaijun on 11/12/14.
 */

public class GameMode1Fragment extends Fragment {

    static String CURRENT_ROUND = "currentRound";
    static String TIME_ROUND = "timeRound";

    GameActivity mActivity;
    TimerWithVibration timer;
    boolean isAnswerSendet;
    int currentRound;
    int timeRound;

    public GameMode1Fragment() {
        this.isAnswerSendet = false;
    }

    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        this.currentRound = getArguments().getInt(CURRENT_ROUND);
        this.timeRound = getArguments().getInt(TIME_ROUND);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_game_mode_1, container, false);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity)getActivity();

        final EditText cityNameEditText = (EditText) mActivity.findViewById(R.id.cityNameEditText);
        final Button sendCityNameBtn = (Button) mActivity.findViewById(R.id.sendCityName);
        final ProgressBar countDownProgressBar = (ProgressBar) mActivity.findViewById(R.id.countDownProgressBar);
        final TextView countDownTimeTextView = (TextView) mActivity.findViewById(R.id.countDownTime);
        final TextView roundNumberTextView = (TextView) mActivity.findViewById(R.id.roundNumber);

        roundNumberTextView.setText(String.valueOf(currentRound));

        sendCityNameBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Utility.hideSoftKeyboard(mActivity);
                String answer = cityNameEditText.getText().toString();
                if(!answer.isEmpty()){
                    sendAnswer(answer);
                    isAnswerSendet = true;
                    mActivity.startFragment(new WaitRoundFragment());
                }
            }
        });

        cityNameEditText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                boolean handled = false;
                if (actionId == EditorInfo.IME_ACTION_GO) {
                    sendCityNameBtn.performClick();
                    handled = true;
                }
                return handled;
            }
        });


        timer = new TimerWithVibration(timeRound, 5, mActivity) {
            @Override
            public void onTimerTick(int second, int percent) {
                countDownTimeTextView.setText(String.valueOf(second));
                countDownProgressBar.setProgress(percent);
            }
            @Override
            public void onTimerFinish() {
                if(!isAnswerSendet){
                    sendAnswer(cityNameEditText.getText().toString());
                    mActivity.startFragment(new WaitRoundFragment());
                }
            }
        };

        timer.start();
    }

    @Override
    public void onPause(){
        super.onPause();
    }
    @Override
    public void onStop(){
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


    private void sendAnswer(String answer){
        String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"" + answer +  "\""+ ", \"userMac\":\"" + User.getInstance().getUserMac() + "\"}";
        //TODO: add SendMessage for channels. adding try catch.
        try {
            mActivity.getCastManager().sendDataMessage(cityNameJSON, getString(R.string.userChannel));
        }
        catch (Exception e){

        }
    }
    public static final GameMode1Fragment newInstance(int currentRound, int timeRound)
    {
        GameMode1Fragment f = new GameMode1Fragment();
        Bundle bdl = new Bundle(2);
        bdl.putInt(CURRENT_ROUND, currentRound);
        bdl.putInt(TIME_ROUND, timeRound);
        f.setArguments(bdl);
        return f;
    }
}