package de.tud.kp.geoguessrcast.fragments;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Activity;
import android.app.Fragment;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.media.Image;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.Toast;

import com.afollestad.materialdialogs.MaterialDialog;
import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.GameProfileAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.managers.GameManager;

public class ChooseProfileFragment extends Fragment {

    private GameActivity mActivity;
    private GameManager mGameManager;

    private ListView mGameProfileListView;
    private GameProfileAdapter mGameProfileAdapter;

    private FloatingActionButton chooseProfileBtn;
    private GameProfile mGameProfile;
    private ImageView customizeBtn;

    Toast mToast;
    CountDownTimer mToastTimer;

    public ChooseProfileFragment() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mToast = Toast.makeText(mActivity, "", Toast.LENGTH_LONG);

        mGameProfileAdapter = new GameProfileAdapter(GameSetting.getInstance().getGameProfiles(), getActivity(), new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int position = (Integer)v.getTag();
                switch (position){
                    case 0:
                        mToast.setText(mActivity.getString(R.string.freechoice_tooltip));
                        break;
                    case 1:
                        mToast.setText(mActivity.getString(R.string.multiplechoice_tooltip));
                        break;
                    case 2:
                        mToast.setText(mActivity.getString(R.string.pointingmode_tooltip));
                        break;
                }
                //show the Toast for more than Toast.LENGTH_LONG
                mToastTimer = new CountDownTimer(5000, 1000)
                {
                    public void onTick(long millisUntilFinished) {mToast.show();}
                    public void onFinish() {mToast.show();}
                }.start();
            }
        });
    }

    @Override
    public void onAttach(Activity activity){
        super.onAttach(activity);
        mActivity = (GameActivity)getActivity();
        mGameManager = mActivity.getGameManager();
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
                    mGameManager.startCustomizingProfile(mActivity);
                }
                else{
                    mGameManager.requestSetGameProfile(mGameProfile);
                    mGameManager.startChoosingHardness(mActivity);
                }
            }
        });

        mGameProfileListView =  (ListView)view.findViewById(R.id.game_profiles_list);
        mGameProfileListView.setAdapter(mGameProfileAdapter);


        mGameProfileListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

//                set  color of selected button
                for(int i=0; i<parent.getCount(); i++){
                    resetItemEffect(parent.getChildAt(i));
                }
                renderItemSelectedEffect(view);

                //show ChooseModeBtn with animation
                showChooseModeBtn();

                mGameProfile = (GameProfile) parent.getItemAtPosition(position);
            }
        });

        customizeBtn = (ImageView) view.findViewById(R.id.customize_btn);
        customizeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                MaterialDialog tipDialog = new MaterialDialog.Builder(mActivity)
                        .title(R.string.customize_tip_title)
                        .content(R.string.customize_confirm_tip)
                        .positiveText(R.string.start_customize)
                        .callback(new MaterialDialog.ButtonCallback() {
                            @Override
                            public void onPositive(MaterialDialog dialog) {
                                super.onNegative(dialog);
                                mGameProfile = null;
                                mActivity.startFragment(CustomizeProfileFragment.newInstance());
                                dialog.dismiss();
                            }
                        })
                        .show();
                tipDialog.setCanceledOnTouchOutside(true);
                tipDialog.setCancelable(true);

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
        Button buttonItem = (Button) view.findViewById(R.id.button_list_item);
        buttonItem.getBackground().setColorFilter(getResources().getColor(R.color.colorPrimary), PorterDuff.Mode.MULTIPLY);
        buttonItem.setTextColor(Color.WHITE);
    }
    private void resetItemEffect(View childView){
        Button buttonItem = (Button) childView.findViewById(R.id.button_list_item);
        buttonItem.getBackground().setColorFilter(null);
        buttonItem.setTextColor(Color.BLACK);
    }

    @Override
    public void onResume() {
        super.onResume();
        mActivity.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    }
    @Override
    public void onPause() {
        super.onPause();
        mActivity.getSupportActionBar().setDisplayHomeAsUpEnabled(false);
        mToast.cancel();
        if(mToastTimer!=null){
            mToastTimer.cancel();
        }
    }

}