package de.tud.kp.geoguessrcast;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Fragment;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;

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
                mActivity.sendMessage(mActivity.mAdminChannel, "{\"event_type\": \"setGameMode\", \"gameMode\": \"1\"}");
                mActivity.startFragment(new WaitingFragment());
            }
        });
    }
}