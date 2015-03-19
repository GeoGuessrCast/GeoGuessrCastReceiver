package de.tud.kp.geoguessrcast.managers;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import de.tud.kp.geoguessrcast.GameActivity;
import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.User;

/**
 * Created by Kaijun on 18/03/15.
 */
public class ProfileBarManager {

    private GameActivity mActivity;
    private User mUser;

    private ImageView profileAvatar;
    private Drawable avatarDrawable;
    private TextView profileUsername;

    private LinearLayout profileRoundInfo;
    private TextView profileCurrentRound;
    private TextView profileMaxRound;

    private LinearLayout profilePointInfo;
    private TextView profilePoints;

    public ProfileBarManager(GameActivity activity){
        mActivity = activity;
        mUser = User.getInstance();

        profileAvatar = (ImageView) mActivity.findViewById(R.id.profile_avatar);
        avatarDrawable = ((Context)mActivity).getResources().getDrawable(R.drawable.ic_account_circle_white_48dp);
        profileUsername = (TextView) mActivity.findViewById(R.id.profile_username);

        profileRoundInfo = (LinearLayout) mActivity.findViewById(R.id.profile_round_info);
        profileCurrentRound = (TextView) mActivity.findViewById(R.id.profile_current_round);
        profileMaxRound = (TextView) mActivity.findViewById(R.id.profile_max_round);

        profilePointInfo = (LinearLayout) mActivity.findViewById(R.id.profile_point_info);
        profilePoints = (TextView) mActivity.findViewById(R.id.profile_points);
    }

    //TODO:  ProfileBarManager!!!
    public void initProfileBar(){

        new Thread() {
            public void run() {
                mActivity.runOnUiThread(new Runnable(){
                    public void run()
                    {
                        //init profile bar
                        String avatarColorString = mUser.getColor();
                        avatarDrawable.setColorFilter(Color.parseColor(avatarColorString), PorterDuff.Mode.MULTIPLY);
                        profileAvatar.setImageDrawable(avatarDrawable);

                        //init profile name;
                        profileUsername.setText(mUser.getUserName());

                        hideRoundInfo();
                        hidePointInfo();
                    }

                });
            }
        }.start();

    }

    public void updateRound(final int currentRound, final int maxRound){
        new Thread() {
            public void run() {
                mActivity.runOnUiThread(new Runnable(){
                    public void run()
                    {
                        if(profileRoundInfo.getVisibility()==View.GONE||profileRoundInfo.getVisibility()== View.INVISIBLE){
                            profileRoundInfo.setVisibility(View.VISIBLE);
                        }
                        profileCurrentRound.setText(Integer.toString(currentRound));
                        profileMaxRound.setText(Integer.toString(maxRound));
                    }

                });
            }
        }.start();
    }

    public void updatePoint(final int addedPoint){
        new Thread() {
            public void run() {
                mActivity.runOnUiThread(new Runnable(){
                    public void run()
                    {
                        int currentPoints = Integer.parseInt(profilePoints.getText().toString());
                        int newPoints = currentPoints + addedPoint;
                        //TODO animation probably? digital increasing
                        profilePoints.setText(Integer.toString(newPoints));
                        mUser.setPoints(newPoints);
                    }

                });
            }
        }.start();
    }

    public void initPointInfo(){
        new Thread() {
            public void run() {
                mActivity.runOnUiThread(new Runnable(){
                    public void run()
                    {
                        if(profilePointInfo.getVisibility()==View.GONE||profilePointInfo.getVisibility()== View.INVISIBLE){
                            profilePointInfo.setVisibility(View.VISIBLE);
                            profileMaxRound.setText(Integer.toString(mUser.getPoints()));
                        }
                    }

                });
            }
        }.start();
    }

    private void hideRoundInfo(){
        //hide profile round info;
        profileRoundInfo.setVisibility(View.GONE);
    }

    private void hidePointInfo(){
        //hide profile point info
        profilePoints.setText(Integer.toString(0));
        profilePointInfo.setVisibility(View.INVISIBLE);
    }

}
