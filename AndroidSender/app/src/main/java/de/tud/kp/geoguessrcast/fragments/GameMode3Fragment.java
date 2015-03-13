package de.tud.kp.geoguessrcast.fragments;


import android.app.FragmentManager;
import android.os.Build;
import android.os.Bundle;
import android.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.getbase.floatingactionbutton.FloatingActionButton;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.gson.Gson;
import com.google.sample.castcompanionlibrary.cast.DataCastManager;

import java.lang.reflect.Field;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.GameMessage;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.TimerWithVibration;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link GameMode3Fragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class GameMode3Fragment extends Fragment {
    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String BOUNDS_PARAM = "boundsArray";
    private static final String MAPTYPE_PARAM = "mapType";
    private static final String ROUND_NUMBER = "currentRound";
    private static final String TIME_ROUND = "timeRound";

    // TODO: Rename and change types of parameters
    private double[] mBounds;
    private String mMapType;
    private int mCurrentRound;
    private int mTimeRound;

    private GameActivity mActivity;
    private static DataCastManager sCastManager;
    private FloatingActionButton confirmBtn;
    private GoogleMap googleMap;
    private LatLng selectedPoi;
    private Marker selectedMarker;
    private TimerWithVibration mTimer;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment GameMode3Fragment.
     */
    // TODO: Rename and change types and number of parameters
    public static GameMode3Fragment newInstance(double[] bounds, String mapType, int roundNumber, int timeRound) {
        GameMode3Fragment fragment = new GameMode3Fragment();
        Bundle args = new Bundle();
        args.putDoubleArray(BOUNDS_PARAM, bounds);
        args.putString(MAPTYPE_PARAM, mapType);
        args.putInt(ROUND_NUMBER, roundNumber);
        args.putInt(TIME_ROUND, timeRound);
        fragment.setArguments(args);
        return fragment;
    }

    public GameMode3Fragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mBounds = getArguments().getDoubleArray(BOUNDS_PARAM);
            mMapType = getArguments().getString(MAPTYPE_PARAM);
            mCurrentRound = getArguments().getInt(ROUND_NUMBER);
            mTimeRound = getArguments().getInt(TIME_ROUND);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_game_mode_3, container, false);

        confirmBtn = (FloatingActionButton)view.findViewById(R.id.answer_confirm_btn);
        confirmBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(selectedPoi!=null){

                    try {
                        GameMessage gameMessage = new GameMessage();
                        gameMessage.setEvent_type("gameRound_answerChosen");
                        String answer = "{\"longitude\":" + selectedPoi.longitude + ", \"latitude\":" + selectedPoi.latitude + "}";
                        gameMessage.setAnswer(answer);
                        gameMessage.setUserMac(User.getInstance().getUserMac());
                        sCastManager.sendDataMessage(new Gson().toJson(gameMessage), getString(R.string.userChannel));
                    }
                    catch (Exception e) {
                    }

                    mActivity.startFragment(new WaitRoundFragment());
                }

            }
        });
        return view;
    }


    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mActivity = (GameActivity) getActivity();
        sCastManager = mActivity.getCastManager();
        setUpMap();


        final ProgressBar countDownProgressBar = (ProgressBar) mActivity.findViewById(R.id.countDownProgressBar);
        //init timer
        mTimer = new TimerWithVibration(mTimeRound, 5, mActivity) {
            @Override
            public void onTimerTick(int second, int percent) {
                countDownProgressBar.setProgress(percent);
            }
            @Override
            public void onTimerFinish() {
                mActivity.startFragment(new WaitRoundFragment());
            }
        };
        mTimer.start();
    }

    private void showChooseModeBtn(){
        if(confirmBtn.getVisibility()==View.INVISIBLE||confirmBtn.getVisibility()==View.GONE){
            Animation slideIn = AnimationUtils.loadAnimation(mActivity.getApplicationContext(), R.anim.abc_slide_in_bottom);
            slideIn.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                    confirmBtn.setVisibility(View.VISIBLE);
                }
                @Override
                public void onAnimationEnd(Animation animation) {}
                @Override
                public void onAnimationRepeat(Animation animation) {}
            });
            confirmBtn.startAnimation(slideIn);
        }
    }


    private void setUpMap(){
        MapFragment mapFragment = getMapFragment();
        googleMap = mapFragment.getMap();
//        googleMap = ((MapFragment) getChildFragmentManager().findFragmentById(R.id.map)).getMap();
        if(googleMap == null){
            return;
        }
        googleMap.setOnMapLoadedCallback(new GoogleMap.OnMapLoadedCallback() {
            @Override
            public void onMapLoaded() {
                initMap(googleMap);
            }
        });
        googleMap.setOnMapClickListener(new GoogleMap.OnMapClickListener() {
            @Override
            public void onMapClick(LatLng latLng) {
                if(selectedMarker!=null){
                    selectedMarker.remove();
                }
                selectedMarker = googleMap.addMarker(new MarkerOptions()
                        .position(latLng).draggable(true));
                selectedPoi = latLng;
                showChooseModeBtn();
            }
        });
    }

    public void initMap(GoogleMap map) {
        //TODO: Switch case
        switch (mMapType){
            case "terrain":
                map.setMapType(GoogleMap.MAP_TYPE_TERRAIN);
                break;
            case "satellite":
                map.setMapType(GoogleMap.MAP_TYPE_SATELLITE);
                break;
            case "roadmap":
                map.setMapType(GoogleMap.MAP_TYPE_NORMAL);
                break;
            case "hybrid":
                map.setMapType(GoogleMap.MAP_TYPE_HYBRID);
                break;
        }
        LatLngBounds bounds = new LatLngBounds(new LatLng(mBounds[0],mBounds[1]),new LatLng(mBounds[2],mBounds[3]));
        map.moveCamera(CameraUpdateFactory.newLatLngBounds(bounds, 0));
    }

    private void clearMapFragment(){
        FragmentManager fm = isVersionLollipop()?getChildFragmentManager():getFragmentManager();
        Fragment mapFragment = getMapFragment();
        try {
            if (mapFragment != null) {
                fm.beginTransaction().remove(mapFragment).commitAllowingStateLoss();
            }
            googleMap.clear();
            googleMap = null;
        }catch (IllegalStateException e) {
            Log.d("Exception", "IllegalStateException");
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }


    @Override
    public void onDetach() {
        super.onDetach();

        try {
            Field childFragmentManager = Fragment.class.getDeclaredField("mChildFragmentManager");
            childFragmentManager.setAccessible(true);
            childFragmentManager.set(this, null);

        } catch (NoSuchFieldException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onDestroy(){
        clearMapFragment();
        resetTimer();
        super.onDestroy();
    }

    private void resetTimer(){
        if(mTimer !=null){
            mTimer.cancel();
            mTimer = null;
        }
    }

    private MapFragment getMapFragment() {
        FragmentManager fm = isVersionLollipop()?getChildFragmentManager():getFragmentManager();
        return (MapFragment) fm.findFragmentById(R.id.map);
    }

    //TODO: put this method into Utility!
    private boolean isVersionLollipop(){
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return false;
        } else {
            return true;
        }
    }
}
