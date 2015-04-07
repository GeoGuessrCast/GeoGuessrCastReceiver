package de.tud.kp.geoguessrcast.fragments;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Activity;
import android.app.Fragment;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;

import com.afollestad.materialdialogs.MaterialDialog;
import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.CityChoiceAdapter;
import de.tud.kp.geoguessrcast.adapters.GameModeAdapter;
import de.tud.kp.geoguessrcast.adapters.GameProfileAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;

public class ChooseModeFragment extends Fragment {

    private GameActivity mActivity;
    private static DataCastManager sCastManager;
    private ListView mGameModeListView;
    private GameModeAdapter mGameModeAdapter;

    private FloatingActionButton chooseModeBtn;
    private GameMode mGameMode;
    private static final String START_MODE = "startMode";
    private int mStartMode;



    public static ChooseModeFragment newInstance(int startMode) {
        ChooseModeFragment fragment = new ChooseModeFragment();
        Bundle args = new Bundle();
        args.putInt(START_MODE, startMode);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mGameModeAdapter = new GameModeAdapter(GameSetting.getInstance().getGameModes(), getActivity());

        if (getArguments() != null) {
            mStartMode = getArguments().getInt(START_MODE);
        }

    }

    @Override
    public void onAttach(Activity activity){
        super.onAttach(activity);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity)getActivity();
        sCastManager = mActivity.getCastManager();
        if(mStartMode==0){
            MaterialDialog tipDialog = new MaterialDialog.Builder(mActivity)
                    .title(R.string.tip)
                    .content(R.string.player_confirm_tip)
                    .positiveText(R.string.choose_mode)
                    .show();
            tipDialog.setCanceledOnTouchOutside(false);
            tipDialog.setCancelable(false);
            mStartMode = 1;
        }



//        mToolTipView.setOnToolTipViewClickedListener(MainActivity.this);

    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_choose_mode, null, false);

        Button showHighScoreBtn = (Button) view.findViewById(R.id.show_high_score);
        showHighScoreBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    GameMessage gameMessage = new GameMessage();
                    gameMessage.setEvent_type("loadHighScore");
                    sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));

                    MaterialDialog highScoreTipDialog = new MaterialDialog.Builder(mActivity)
                            .title(R.string.tip)
                            .content(R.string.high_score_tip)
                            .positiveText(R.string.back_to_menu)
                            .callback(new MaterialDialog.ButtonCallback() {
                                @Override
                                public void onPositive(MaterialDialog dialog) {
                                    super.onPositive(dialog);
                                    try {
                                        GameMessage gameMessage = new GameMessage();
                                        gameMessage.setEvent_type("loadMainMenu");
                                        sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));
                                    }
                                    catch (Exception e) {
                                    }
                                }
                            })
                            .show();
                    highScoreTipDialog.setCanceledOnTouchOutside(false);
                    highScoreTipDialog.setCancelable(false);

                }
                catch (Exception e) {
                }
            }
        });

        chooseModeBtn = (FloatingActionButton) view.findViewById(R.id.choose_mode_btn);
        chooseModeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(mGameMode != null){
                    //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                    try {
                        GameMessage gameMessage = new GameMessage();
                        gameMessage.setEvent_type("setGameMode");
                        gameMessage.setGameMode(mGameMode);
                        sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));

                        //persist the gameMode
                        GameSetting.getInstance().setSelectedGameMode(mGameMode);

                    } catch (Exception e) {
                    }
                    mActivity.startFragment(new ChooseProfileFragment());
                }
            }
        });

        // Set the adapter
        mGameModeListView =  (ListView)view.findViewById(R.id.game_modes_list);
        mGameModeListView.setAdapter(mGameModeAdapter);


        mGameModeListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

                //set  color of selected button
                for(int i=0; i<parent.getCount(); i++){
                    resetItemEffect(parent.getChildAt(i));
                }
                renderItemSelectedEffect(view);

                //show ChooseModeBtn with animation
                showChooseModeBtn();

                mGameMode = (GameMode) parent.getItemAtPosition(position);
            }
        });




        return view;
    }



    private void showChooseModeBtn(){
        if(chooseModeBtn.getVisibility()==View.INVISIBLE || chooseModeBtn.getVisibility()==View.GONE){
            Animation slideIn = AnimationUtils.loadAnimation(mActivity.getApplicationContext(), R.anim.abc_slide_in_bottom);
            slideIn.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                    chooseModeBtn.setVisibility(View.VISIBLE);
                }
                @Override
                public void onAnimationEnd(Animation animation) {}
                @Override
                public void onAnimationRepeat(Animation animation) {}
            });
            chooseModeBtn.startAnimation(slideIn);
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