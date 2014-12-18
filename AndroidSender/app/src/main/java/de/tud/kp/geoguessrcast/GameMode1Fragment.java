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

        Button sendCityNameBtn = (Button) mActivity.findViewById(R.id.sendCityName);

        sendCityNameBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                final EditText cityNameEditText = (EditText) mActivity.findViewById(R.id.cityNameEditText);
                String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"" + cityNameEditText.getText().toString() +  "\""+ ", \"userMac\":\"" + mActivity.user.getUserMac() + "\"}";
                mActivity.sendMessage(mActivity.mUserChannel, cityNameJSON);
                isAnswerSendet = true;
                mActivity.startFragment(new WaitingFragment());

            }
        });

        final TextView timerTextView = (TextView) mActivity.findViewById(R.id.gameTimer);

        timer = new CountDownTimer(60000, 1000) {
            public void onTick(long millisUntilFinished) {
                timerTextView.setText(String.valueOf(millisUntilFinished / 1000));
            }
            public void onFinish() {
                if(mActivity.user.isAdmin() == true){
                    String roundEndedJSON = getRoundEndedJSONString();
                    mActivity.sendMessage(mActivity.mAdminChannel, roundEndedJSON);
                }
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

    private String getRoundEndedJSONString(){
        GameMessage roundEndedMsg = new GameMessage();
        roundEndedMsg.setEvent_type("setGameRoundEnded");
        roundEndedMsg.setGameMode("1");
        final Gson gson = new Gson();
        String jsonString = gson.toJson(roundEndedMsg);
        return jsonString;
    }


}