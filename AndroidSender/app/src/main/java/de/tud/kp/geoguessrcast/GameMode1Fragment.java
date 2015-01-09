package de.tud.kp.geoguessrcast;

import android.app.Activity;
import android.app.Fragment;
import android.content.Context;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Vibrator;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import org.w3c.dom.Text;

/**
 * Created by Kaijun on 11/12/14.
 */

public class GameMode1Fragment extends Fragment {

    static String CURRENT_ROUND = "currentRound";
    static String TIME_ROUND = "timeRound";

    MainActivity mActivity;
    CountDownTimer timer;
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
        mActivity = (MainActivity)getActivity();

        final EditText cityNameEditText = (EditText) mActivity.findViewById(R.id.cityNameEditText);
        final Button sendCityNameBtn = (Button) mActivity.findViewById(R.id.sendCityName);
        final ProgressBar countDownProgressBar = (ProgressBar) mActivity.findViewById(R.id.countDownProgressBar);
        final TextView countDownTimeTextView = (TextView) mActivity.findViewById(R.id.countDownTime);
        final TextView roundNumberTextView = (TextView) mActivity.findViewById(R.id.roundNumber);

        roundNumberTextView.setText(String.valueOf(currentRound));

        sendCityNameBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"" + cityNameEditText.getText().toString() +  "\""+ ", \"userMac\":\"" + mActivity.user.getUserMac() + "\"}";
                mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
                isAnswerSendet = true;
                hideSoftKeyboard(mActivity);
                mActivity.startFragment(new WaitRoundFragment());

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

        //TODO timer added into Utility
        timer = new CountDownTimer(timeRound, 1000) {
            public void onTick(long millisUntilFinished) {
                long seconds = millisUntilFinished / 1000;
                int percent = (int)seconds*100/(timeRound/1000);
                countDownTimeTextView.setText(String.valueOf(seconds));
                countDownProgressBar.setProgress(percent);
                //if the time is less than 5 sec, then make a vibration
                //TODO 默认seconds=5, 可以多参数传入 也可以不传
                if((int)seconds==5){
                    Vibrator vibrator = (Vibrator) mActivity.getSystemService(mActivity.VIBRATOR_SERVICE);
                    long[] pattern = {0, 100, 50, 100};
                    vibrator.vibrate(pattern, -1);
                }
            }
            public void onFinish() {
                if(!isAnswerSendet){
                    String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"\""+ ", \"userMac\":\"" + mActivity.user.getUserMac() + "\"}";
                    mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
                    mActivity.startFragment(new WaitRoundFragment());
                }
            }
        };
        //notify the player that the round already started!
        Vibrator vibrator = (Vibrator) mActivity.getSystemService(mActivity.VIBRATOR_SERVICE);
        long[] pattern = {0, 200};
        vibrator.vibrate(pattern, -1);

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

    //TODO remove if Utility finished!
    public static void hideSoftKeyboard(Activity activity) {
        InputMethodManager inputMethodManager = (InputMethodManager)  activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        try{
            inputMethodManager.hideSoftInputFromWindow(activity.getCurrentFocus().getWindowToken(), 0);
        }
        catch (Exception e){
            Log.e(activity.getClass().getSimpleName(), "Exception while hiding soft keyboard", e);
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