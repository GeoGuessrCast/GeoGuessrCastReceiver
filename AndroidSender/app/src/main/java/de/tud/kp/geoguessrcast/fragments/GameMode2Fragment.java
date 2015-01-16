package de.tud.kp.geoguessrcast.fragments;

import android.app.Activity;
import android.os.Bundle;
import android.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

import de.tud.kp.geoguessrcast.R;

import de.tud.kp.geoguessrcast.fragments.dummy.DummyContent;

/**
 * A fragment representing a list of Items.
 * <p/>
 * Large screen devices (such as tablets) are supported by replacing the ListView
 * with a GridView.
 * <p/>
 * Activities containing this fragment MUST implement the {@link OnFragmentInteractionListener}
 * interface.
 */

public class GameMode2Fragment extends Fragment implements AbsListView.OnItemClickListener {

    private static final String ROUND_NUMBER = "roundNumber";
    private static final String TIME_ROUND = "timeRound";
    private int roundNumber;
    private int timeRound;
    private AbsListView mListView;
    private ListAdapter mAdapter;

    // TODO: Rename and change types of parameters
    public static GameMode2Fragment newInstance(int roundNumber, int timeRound) {
        GameMode2Fragment fragment = new GameMode2Fragment();
        Bundle args = new Bundle();
        args.putInt(ROUND_NUMBER, roundNumber);
        args.putInt(TIME_ROUND, timeRound);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getArguments() != null) {
            roundNumber = getArguments().getInt(ROUND_NUMBER);
            timeRound = getArguments().getInt(TIME_ROUND);
        }

        // TODO: Change Adapter to display your content
        List<String> citiesArray = new ArrayList<String>(){{
            add("Berlin");
            add("Dresden");
            add("Hamburg");
            add("München");
            add("Essen");
            add("Hannover");
        }};

        mAdapter = new ArrayAdapter<String>(getActivity(),
                android.R.layout.simple_list_item_1, android.R.id.text1, citiesArray);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game_mode_2, container, false);

        // Set the adapter
        mListView = (AbsListView) view.findViewById(android.R.id.list);
        ((AdapterView<ListAdapter>) mListView).setAdapter(mAdapter);

        // Set OnItemClickListener so we can be notified on item clicks
        mListView.setOnItemClickListener(this);

        return view;
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        /*try {
            mListener = (OnFragmentInteractionListener) activity;
        } catch (ClassCastException e) {
            throw new ClassCastException(activity.toString()
                    + " must implement OnFragmentInteractionListener");
        }*/
    }

    @Override
    public void onDetach() {
        super.onDetach();
//        mListener = null;
    }


    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        /*
        if (null != mListener) {
            // Notify the active callbacks interface (the activity, if the
            // fragment is attached to one) that an item has been selected.
            mListener.onFragmentInteraction(DummyContent.ITEMS.get(position).id);
        }
        */
        String item = (String)parent.getItemAtPosition(position);
        Log.d("Test", item);
    }

}
