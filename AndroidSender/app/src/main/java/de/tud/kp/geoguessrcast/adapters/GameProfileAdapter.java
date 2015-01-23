package de.tud.kp.geoguessrcast.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;

import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameProfile;

/**
 * Created by Kaijun on 23/01/15.
 */
public class GameProfileAdapter extends BaseAdapter {
    private GameProfile[] mGameProfiles;
    private LayoutInflater mLayoutInflater;

    public GameProfileAdapter(GameProfile[] gameProfiles, Context context) {
        mGameProfiles = gameProfiles;
        mLayoutInflater = LayoutInflater.from(context);
    }

    public int getCount() {
        return mGameProfiles.length;
    }

    public Object getItem(int position) {
        return mGameProfiles[position];
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(int position, View convertView, ViewGroup parent) {

        convertView= mLayoutInflater.inflate(R.layout.fragment_button_list_item, null);
        Button btnItem = (Button) convertView.findViewById(R.id.button_list_item);
        btnItem.setText(mGameProfiles[position].getProfileName());
//        btnItem.setClickable(false);
        return convertView;
    }
}