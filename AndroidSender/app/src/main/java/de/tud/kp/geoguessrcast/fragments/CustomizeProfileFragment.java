package de.tud.kp.geoguessrcast.fragments;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;

import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.MapOption;


public class CustomizeProfileFragment extends Fragment {

    private GameActivity mActivity;
    private static DataCastManager sCastManager;

    public static CustomizeProfileFragment newInstance() {
        CustomizeProfileFragment fragment = new CustomizeProfileFragment();
        return fragment;
    }

    public CustomizeProfileFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_customize_profile, container, false);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {

        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity) getActivity();
        sCastManager = mActivity.getCastManager();

        final Switch limitedCountry = (Switch) mActivity.findViewById(R.id.limited_country);
        final Switch multipleChoice = (Switch) mActivity.findViewById(R.id.multiple_choice_mode);
        final Switch pointingMode = (Switch) mActivity.findViewById(R.id.pointing_mode);
        final SeekBar minPopulation = (SeekBar) mActivity.findViewById(R.id.min_population);
        final SeekBar timePerRound = (SeekBar) mActivity.findViewById(R.id.time_per_round);
        final RadioGroup mapType = (RadioGroup) mActivity.findViewById(R.id.map_type);
        final Switch mapBorders = (Switch) mActivity.findViewById(R.id.map_borders);
        final Switch mapRoads = (Switch) mActivity.findViewById(R.id.map_roads);
        final Switch showCityName = (Switch) mActivity.findViewById(R.id.show_city_names);
        final Switch showRiverName = (Switch) mActivity.findViewById(R.id.show_river_names);
        final Switch showCountryName = (Switch) mActivity.findViewById(R.id.show_country_names);

        final Button confirmBtn = (Button) mActivity.findViewById(R.id.customize_profile_confirm);

        confirmBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Build MapOption Object
                GameProfile gameProfile = new GameProfile();
                gameProfile.setProfileName("Custom Profile");
                gameProfile.setId(5);

                //TODO: country choose!!!
                gameProfile.setLimitedCountry(null);
                gameProfile.setMultipleChoiceMode(multipleChoice.isChecked());
                gameProfile.setPointingMode(pointingMode.isChecked());
                gameProfile.setMinPopulationDefault(minPopulation.getProgress());
                gameProfile.setTimePerRoundSec(timePerRound.getProgress());

                MapOption mapOption = new MapOption();
                int mapTypeIndex = mapType.indexOfChild(mActivity.findViewById(mapType.getCheckedRadioButtonId()));
                switch (mapTypeIndex){
                    case 0:
                        mapOption.setMapType("roadmap");
                        break;
                    case 1:
                        mapOption.setMapType("hybrid");
                        break;
                    case 2:
                        mapOption.setMapType("terrain");
                        break;
                    default:
                        mapOption.setMapType("hybrid");
                        break;
                }

                mapOption.setBorders(mapBorders.isChecked());
                mapOption.setRoads(mapRoads.isChecked());
                mapOption.setShowCityNames(showCityName.isChecked());
                mapOption.setShowRiverNames(showRiverName.isChecked());
                mapOption.setShowCountryNames(showCountryName.isChecked());

                gameProfile.setMapOption(mapOption);

                //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                try {
                    GameMessage gameMessage = new GameMessage();
                    gameMessage.setEvent_type("setGameProfile");
                    gameMessage.setGameProfile(gameProfile);
                    Log.d("test", new Gson().toJson(gameMessage));
                    sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));
                }
                catch (Exception e){

                }
                mActivity.startFragment(new WaitGameFragment());


            }
        });
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
    }

    @Override
    public void onDetach() {
        super.onDetach();
    }



}
