package de.tud.kp.geoguessrcast.fragments;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;

public class ChooseModeFragment extends Fragment {

    private GameActivity mActivity;
    private static DataCastManager sCastManager;

    public ChooseModeFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_choose_mode, null, false);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity)getActivity();
        sCastManager = mActivity.getCastManager();

        Button chooseModeBtn = (Button) mActivity.findViewById(R.id.chooseMode);
        chooseModeBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                mActivity.findViewById(R.id.playerConfirmTip).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameModes).setVisibility(View.VISIBLE);
            }
        });

        //TODO: nur zum Test, ListView!!!!!
        Button gameMode1Btn = (Button) mActivity.findViewById(R.id.gameMode1);
        gameMode1Btn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                //TODO: add SendMessage for channels. adding try catch.
                try {
                    sCastManager.sendDataMessage("{\"event_type\": \"setGameMode\", \"gameModeNumber\": \"1\" }",getString(R.string.adminChannel));
                }
                catch (Exception e){

                }
                mActivity.findViewById(R.id.gameModes).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameProfiles).setVisibility(View.VISIBLE);
            }
        });

        Button gameProfile1Btn = (Button) mActivity.findViewById(R.id.gameProfile1);
        gameProfile1Btn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                //TODO: add SendMessage for channels. adding try catch.
                try {
                    sCastManager.sendDataMessage("{\"event_type\": \"setGameProfile\", \"gameProfileNumber\": 1}", getString(R.string.adminChannel));
                }
                catch (Exception e){

                }
                mActivity.startFragment(new WaitGameFragment());
            }
        });

        Button gameProfile2Btn = (Button) mActivity.findViewById(R.id.gameProfile2);
        gameProfile2Btn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                //TODO: add SendMessage for channels. adding try catch.
                try {
                    sCastManager.sendDataMessage("{\"event_type\": \"setGameProfile\", \"gameProfileNumber\": 2}", getString(R.string.adminChannel));
                }
                catch (Exception e){

                }
                mActivity.startFragment(new WaitGameFragment());
            }
        });


    }
}