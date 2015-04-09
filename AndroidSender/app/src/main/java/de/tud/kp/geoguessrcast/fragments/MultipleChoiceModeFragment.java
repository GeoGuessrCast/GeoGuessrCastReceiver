package de.tud.kp.geoguessrcast.fragments;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.CityChoiceAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.managers.GameManager;
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

public class MultipleChoiceModeFragment extends Fragment  {

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
    private FloatingActionButton confirmBtn;
    private String mAnswer;
    private GameManager mGameManager;

    public static MultipleChoiceModeFragment newInstance(int roundNumber, int timeRound, String[] choices) {
        MultipleChoiceModeFragment fragment = new MultipleChoiceModeFragment();
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

        confirmBtn = (FloatingActionButton)view.findViewById(R.id.answer_confirm_btn);
        confirmBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(mAnswer!=null){
                    mGameManager.requestAnswerChosen(mAnswer);
                    mGameManager.startWaitingRound(mActivity);
                }

            }
        });

        // Set the adapter
        mListView =  (ListView)view.findViewById(R.id.game_mode_2_list);
        mListView.setAdapter(mAdapter);

        // Set OnItemClickListener so we can be notified on item clicks
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                //set  color of selected button
                for(int i=0; i<parent.getCount(); i++){
                    resetItemEffect(parent.getChildAt(i));
                }
                renderItemSelectedEffect(view);

                mAnswer = (String) parent.getItemAtPosition(position);
                showChooseModeBtn();
            }
        });

        return view;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity) getActivity();
        mGameManager = mActivity.getGameManager();

        final ProgressBar countDownProgressBar = (ProgressBar) mActivity.findViewById(R.id.countDownProgressBar);
        final TextView countDownTimeTextView = (TextView) mActivity.findViewById(R.id.countDownTime);

        //init Timer
        mTimer = new TimerWithVibration(timeRound, 5, mActivity) {
            @Override
            public void onTimerTick(int second, int percent) {
                countDownTimeTextView.setText(String.valueOf(second));
                countDownProgressBar.setProgress(percent);
            }
            @Override
            public void onTimerFinish() {
                mGameManager.startWaitingRound(mActivity);
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

    private void showChooseModeBtn(){
        if(confirmBtn.getVisibility()==View.INVISIBLE||confirmBtn.getVisibility()==View.GONE){
            Animation slideIn = AnimationUtils.loadAnimation(mActivity.getApplicationContext(), R.anim.abc_slide_in_bottom);
            slideIn.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                    confirmBtn.setVisibility(View.VISIBLE);
                }
                @Override
                public void onAnimationEnd(Animation animation) {}
                @Override
                public void onAnimationRepeat(Animation animation) {}
            });
            confirmBtn.startAnimation(slideIn);
        }
    }
    private void renderItemSelectedEffect(View view){
        view.getBackground().setColorFilter(getResources().getColor(R.color.colorPrimary), PorterDuff.Mode.MULTIPLY);
        ((Button)view).setTextColor(Color.WHITE);
    }
    private void resetItemEffect(View childView){
        childView.getBackground().setColorFilter(null);
        ((Button)childView).setTextColor(Color.BLACK);
    }
}
