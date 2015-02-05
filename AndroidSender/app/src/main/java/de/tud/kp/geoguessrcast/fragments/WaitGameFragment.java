package de.tud.kp.geoguessrcast.fragments;

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import de.tud.kp.geoguessrcast.R;

/**
 * Created by Kaijun on 02/12/14.
 */
public class WaitGameFragment extends Fragment{

    public WaitGameFragment() {

    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_wait_game, container, false);
    }
}
