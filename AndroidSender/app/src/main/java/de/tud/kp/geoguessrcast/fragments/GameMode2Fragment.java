package de.tud.kp.geoguessrcast.fragments;

import android.app.Activity;
import android.os.Bundle;
import android.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.CityChoiceAdapter;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.TimerWithVibration;

/**
 * A fragment representing a list of Items.
 * <p/>
 * Large screen devices (such as tablets) are supported by replacing the ListView
 * with a GridView.
 * <p/>
 * Activities containing this fragment MUST implement the {@link //OnFragmentInteractionListener}
 * interface.
 */

public class GameMode2Fragment extends Fragment  {

    private static final String ROUND_NUMBER = "currentRound";
    private static final String TIME_ROUND = "timeRound";
    private static final String CHOICES = "choices";
    private GameActivity mActivity;
    private int currentRound;
    private int timeRound;
    private String[] cityChoices;
    private ListView mListView;
    private CityChoiceAdapter mAdapter;
    private TimerWithVibration mTimer;

    // TODO: Rename and change types of parameters
    public static GameMode2Fragment newInstance(int roundNumber, int timeRound, String[] choices) {
        GameMode2Fragment fragment = new GameMode2Fragment();
        Bundle args = new Bundle();
        args.putInt(ROUND_NUMBER, roundNumber);
        args.putInt(TIME_ROUND, timeRound);
        args.putStringArray(CHOICES, choices);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getArguments() != null) {
            currentRound = getArguments().getInt(ROUND_NUMBER);
            timeRound = getArguments().getInt(TIME_ROUND);
            cityChoices = getArguments().getStringArray(CHOICES);
        }

        mAdapter = new CityChoiceAdapter(cityChoices, getActivity());
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game_mode_2, container, false);

        // Set the adapter
        mListView =  (ListView)view.findViewById(R.id.game_mode_2_list);
        mListView.setAdapter(mAdapter);

        // Set OnItemClickListener so we can be notified on item clicks
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String answer = (String) parent.getItemAtPosition(position);

                String cityNameJSON = "{\"event_type\":\"gameRound_answerChosen\" , \"answer\":" + "\"" + answer +  "\""+ ", \"userMac\":\"" + User.getInstance().getUserMac() + "\"}";
                //TODO: add SendMessage for channels. adding try catch.
                try {
                    mActivity.getCastManager().sendDataMessage(cityNameJSON, getString(R.string.userChannel));
                }
                catch (Exception e){

                }
                mActivity.startFragment(new WaitRoundFragment());
            }
        });

        return view;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity) getActivity();

        final ProgressBar countDownProgressBar = (ProgressBar) mActivity.findViewById(R.id.countDownProgressBar);
        final TextView countDownTimeTextView = (TextView) mActivity.findViewById(R.id.countDownTime);
        final TextView roundNumberTextView = (TextView) mActivity.findViewById(R.id.roundNumber);

        //init show of round number
        roundNumberTextView.setText(String.valueOf(currentRound));

        //init timer
        mTimer = new TimerWithVibration(timeRound, 5, mActivity) {
            @Override
            public void onTimerTick(int second, int percent) {
                countDownTimeTextView.setText(String.valueOf(second));
                countDownProgressBar.setProgress(percent);
            }
            @Override
            public void onTimerFinish() {
                mActivity.startFragment(new WaitRoundFragment());
            }
        };

        mTimer.start();
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
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
        if(mTimer !=null){
            mTimer.cancel();
            mTimer = null;
        }
    }

}
