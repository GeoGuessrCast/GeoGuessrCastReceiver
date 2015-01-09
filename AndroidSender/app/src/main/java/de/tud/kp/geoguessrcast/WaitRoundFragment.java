package de.tud.kp.geoguessrcast;

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by Kaijun on 02/12/14.
 */
public class WaitRoundFragment extends Fragment{

    //TODO show Time maybe, show Round, show Point!
    public WaitRoundFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_wait_round, container, false);
    }
}
