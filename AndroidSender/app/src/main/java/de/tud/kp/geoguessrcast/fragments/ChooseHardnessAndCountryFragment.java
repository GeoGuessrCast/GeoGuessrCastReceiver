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
import android.widget.CompoundButton;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;

import com.afollestad.materialdialogs.MaterialDialog;
import com.countrypicker.CountryPicker;
import com.countrypicker.CountryPickerListener;
import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import org.adw.library.widgets.discreteseekbar.DiscreteSeekBar;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.GameModeAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;

public class ChooseHardnessAndCountryFragment extends Fragment {


    public class HardnessNumericTransformer extends DiscreteSeekBar.NumericTransformer {

        public int transform(int value){
            return value;
        };
        public String transformToString(int value) {
            if(value==0){
                return "E";
            }
            else if(value==2){
                return "M";
            }
            else if(value==4){
                return "H";
            }
            return "";
        }
        public boolean useStringTransform() {
            return true;
        }
    }


    private GameActivity mActivity;
    private static DataCastManager sCastManager;
    private DiscreteSeekBar mGameHardnessSeekBar;
    private String mSelectedCountry;

    private FloatingActionButton chooseModeBtn;


    public static ChooseHardnessAndCountryFragment newInstance() {
        ChooseHardnessAndCountryFragment fragment = new ChooseHardnessAndCountryFragment();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_choose_hardness, null, false);

        //check if the game mode is Country Guessing, if true -> hide country setting view
        if(GameSetting.getInstance().getSelectedGameMode().getGameModeName().equals("Country Guessing")){
            view.findViewById(R.id.country_setting).setVisibility(View.GONE);
        }


        mGameHardnessSeekBar = (DiscreteSeekBar)view.findViewById(R.id.game_hardness);
        mGameHardnessSeekBar.setNumericTransformer(new HardnessNumericTransformer());

        final TextView limitedCountry = (TextView) view.findViewById(R.id.limited_country);
        limitedCountry.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final CountryPicker picker = CountryPicker.newInstance("Select Country", GameSetting.getInstance().getCountries());
                picker.show(mActivity.getSupportFragmentManager(), "COUNTRY_PICKER");
                picker.setListener(new CountryPickerListener() {
                    @Override
                    public void onSelectCountry(String countryName, String countryCode) {
                        mSelectedCountry = countryCode;
                        limitedCountry.setText(countryName);
                        picker.dismiss();
                    }
                });

                //TODO: picer dismissed when click back button, but the switcher is not notified... must implement a interface in onCancle
            }
        });


        chooseModeBtn = (FloatingActionButton) view.findViewById(R.id.choose_mode_btn);
        chooseModeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                    //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                    try {
                        //TODO set hardness
                        GameMessage gameMessage2 = new GameMessage();
                        gameMessage2.setEvent_type("setHardness");
                        gameMessage2.setHardness(transformHardness(mGameHardnessSeekBar.getProgress()));
                        gameMessage2.setCountryCode(mSelectedCountry);
                        sCastManager.sendDataMessage(new Gson().toJson(gameMessage2), getString(R.string.adminChannel));
                    } catch (Exception e) {
                    }
                    mActivity.startFragment(new WaitGameFragment());
                }

        });

        return view;
    }

    private double transformHardness(int originalHardness){
        return (originalHardness-2)/2;
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
    }


}