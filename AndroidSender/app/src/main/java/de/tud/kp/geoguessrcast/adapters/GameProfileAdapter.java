package de.tud.kp.geoguessrcast.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.ImageView;

import java.util.Arrays;

import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.GameMode;
import de.tud.kp.geoguessrcast.beans.GameProfile;

/**
 * Created by Kaijun on 23/01/15.
 */
public class GameProfileAdapter extends BaseAdapter {
    private GameProfile[] mGameProfiles;
    private LayoutInflater mLayoutInflater;
    private View.OnClickListener mTooltipClickListener;

    public GameProfileAdapter(GameProfile[] gameProfiles, Context context, View.OnClickListener tooltipClickListener) {
        mGameProfiles = gameProfiles;
        mGameProfiles = Arrays.copyOf(mGameProfiles, mGameProfiles.length-1);

        mLayoutInflater = LayoutInflater.from(context);
        mTooltipClickListener = tooltipClickListener;
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

        convertView= mLayoutInflater.inflate(R.layout.fragment_button_with_tooltip_list_item, null);
        Button btnItem = (Button) convertView.findViewById(R.id.button_list_item);
        ImageView tooltipIcon = (ImageView) convertView.findViewById(R.id.tooltip_icon);
        tooltipIcon.setTag(position);
        tooltipIcon.setOnClickListener(mTooltipClickListener);
        btnItem.setText(mGameProfiles[position].getProfileName());
//        btnItem.setClickable(false);
        return convertView;
    }
}