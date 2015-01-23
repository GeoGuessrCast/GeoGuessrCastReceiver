package de.tud.kp.geoguessrcast.fragments;

/**
 * Created by Kaijun on 03/12/14.
 */

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;

import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.adapters.CityChoiceAdapter;
import de.tud.kp.geoguessrcast.adapters.GameModeAdapter;
import de.tud.kp.geoguessrcast.adapters.GameProfileAdapter;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameProfile;
import de.tud.kp.geoguessrcast.beans.GameSetting;
import de.tud.kp.geoguessrcast.beans.User;

public class ChooseModeFragment extends Fragment {

    private GameActivity mActivity;
    private static DataCastManager sCastManager;
    private ListView mGameModeListView;
    private GameModeAdapter mGameModeAdapter;
    private ListView mGameProfileListView;
    private GameProfileAdapter mGameProfileAdapter;

    public ChooseModeFragment() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mGameModeAdapter = new GameModeAdapter(GameSetting.getInstance().getGameModes(), getActivity());
        mGameProfileAdapter = new GameProfileAdapter(GameSetting.getInstance().getGameProfiles(), getActivity());
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_choose_mode, null, false);

        Button chooseModeBtn = (Button) view.findViewById(R.id.chooseMode);
        chooseModeBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                mActivity.findViewById(R.id.playerConfirmTip).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameModes).setVisibility(View.VISIBLE);
            }
        });


        // Set the adapter
        mGameModeListView =  (ListView)view.findViewById(R.id.game_modes_list);
        mGameModeListView.setAdapter(mGameModeAdapter);

        mGameProfileListView =  (ListView)view.findViewById(R.id.game_profiles_list);
        mGameProfileListView.setAdapter(mGameProfileAdapter);


        mGameModeListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                GameMode gameMode = (GameMode) parent.getItemAtPosition(position);

                //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                try {
                    GameMessage gameMessage = new GameMessage();
                    gameMessage.setEvent_type("setGameMode");
                    gameMessage.setGameMode(gameMode);
                    sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));
                } catch (Exception e) {

                }
                mActivity.findViewById(R.id.gameModes).setVisibility(View.GONE);
                mActivity.findViewById(R.id.gameProfiles).setVisibility(View.VISIBLE);
            }
        });

        mGameProfileListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                GameProfile gameProfile = (GameProfile) parent.getItemAtPosition(position);

                //TODO: EventTransitionManager:  add SendMessage for channels. adding try catch.
                try {
                    GameMessage gameMessage = new GameMessage();
                    gameMessage.setEvent_type("setGameProfile");
                    gameMessage.setGameProfile(gameProfile);
                    sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.adminChannel));
                }
                catch (Exception e){

                }
                mActivity.startFragment(new WaitGameFragment());
            }
        });




        return view;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState){
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity)getActivity();
        sCastManager = mActivity.getCastManager();


    }
}