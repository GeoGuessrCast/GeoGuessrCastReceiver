package de.tud.kp.geoguessrcast;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

public class ChooseModeFragment extends Fragment {

    MainActivity mActivity;

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
        mActivity = (MainActivity)getActivity();

        Button chooseModeBtn = (Button) mActivity.findViewById(R.id.chooseMode);
        chooseModeBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                mActivity.findViewById(R.id.playerConfirmTip).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameModes).setVisibility(View.VISIBLE);
            }
        });

        //nur zum Test
        Button gameMode1Btn = (Button) mActivity.findViewById(R.id.gameMode1);
        gameMode1Btn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
//                mActivity.sendMessage(mActivity.mAdminChannel, "{\"event_type\": \"startGame\", \"gameMode\": \"1\" , \"profile\": \"1\"}");
//                mActivity.startFragment(new WaitingFragment());
                mActivity.sendMessage(mActivity.mAdminChannel, "{\"event_type\": \"setGameMode\", \"gameModeNumber\": \"1\" }");
                mActivity.findViewById(R.id.gameModes).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameProfiles).setVisibility(View.VISIBLE);
            }
        });

        Button gameProfile1Btn = (Button) mActivity.findViewById(R.id.gameProfile1);
        gameProfile1Btn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                mActivity.sendMessage(mActivity.mAdminChannel, "{\"event_type\": \"setGameProfile\", \"gameProfileNumber\": \"1\"}");
                mActivity.startFragment(new WaitGameFragment());
            }
        });
    }
}