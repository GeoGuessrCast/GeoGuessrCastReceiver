package de.tud.kp.geoguessrcast.fragments;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Activity;
import android.app.Fragment;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;

import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.GameProfileAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.GameSetting;

public class ChooseProfileFragment extends Fragment {

    private GameActivity mActivity;
    private static DataCastManager sCastManager;

    private ListView mGameProfileListView;
    private GameProfileAdapter mGameProfileAdapter;

    private FloatingActionButton chooseProfileBtn;
    private GameProfile mGameProfile;

    public ChooseProfileFragment() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mGameProfileAdapter = new GameProfileAdapter(GameSetting.getInstance().getGameProfiles(), getActivity());
    }

    @Override
    public void onAttach(Activity activity){
        super.onAttach(activity);
        mActivity = (GameActivity)getActivity();
        sCastManager = mActivity.getCastManager();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_choose_profile, null, false);

        chooseProfileBtn = (FloatingActionButton) view.findViewById(R.id.choose_profile_btn);
        chooseProfileBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(mGameProfile==null){
                    mActivity.startFragment(CustomizeProfileFragment.newInstance());
                }
                else{
                    //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                    try {
                        GameMessage gameMessage = new GameMessage();
                        gameMessage.setEvent_type("setGameProfile");
                        gameMessage.setGameProfile(mGameProfile);
                        sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));
                    }
                    catch (Exception e){

                    }
                    mActivity.startFragment(new WaitGameFragment());
                }
            }
        });

        mGameProfileListView =  (ListView)view.findViewById(R.id.game_profiles_list);
        mGameProfileListView.setAdapter(mGameProfileAdapter);


        mGameProfileListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

                //set  color of selected button
                for(int i=0; i<parent.getCount(); i++){
                    resetItemEffect(parent.getChildAt(i));
                }
                renderItemSelectedEffect(view);

                //show ChooseModeBtn with animation
                showChooseModeBtn();

                if(position==parent.getCount()-1){
                    mGameProfile = null;
                }
                else{
                    mGameProfile = (GameProfile) parent.getItemAtPosition(position);
                }
            }
        });
        return view;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);

    }

    private void showChooseModeBtn(){
        if(chooseProfileBtn.getVisibility()==View.INVISIBLE ||chooseProfileBtn.getVisibility()==View.GONE){
            Animation slideIn = AnimationUtils.loadAnimation(mActivity.getApplicationContext(), R.anim.abc_slide_in_bottom);
            slideIn.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                    chooseProfileBtn.setVisibility(View.VISIBLE);
                }
                @Override
                public void onAnimationEnd(Animation animation) {}
                @Override
                public void onAnimationRepeat(Animation animation) {}
            });
            chooseProfileBtn.startAnimation(slideIn);
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