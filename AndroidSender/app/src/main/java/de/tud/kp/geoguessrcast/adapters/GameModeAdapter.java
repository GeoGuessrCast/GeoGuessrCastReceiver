package de.tud.kp.geoguessrcast.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;

import de.tud.kp.geoguessrcast.R;
import de.tud.kp.geoguessrcast.beans.GameMode;

/**
 * Created by Kaijun on 23/01/15.
 */
public class GameModeAdapter extends BaseAdapter {
    private GameMode[] mGameModes;
    private LayoutInflater mLayoutInflater;

    public GameModeAdapter(GameMode[] gameModes, Context context) {
        mGameModes = gameModes;
        mLayoutInflater = LayoutInflater.from(context);
    }

    public int getCount() {
        return mGameModes.length;
    }

    public Object getItem(int position) {
        return mGameModes[position];
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(int position, View convertView, ViewGroup parent) {

        convertView= mLayoutInflater.inflate(R.layout.fragment_button_list_item, null);
        Button btnItem = (Button) convertView.findViewById(R.id.button_list_item);
        btnItem.setText(mGameModes[position].getGameModeName());
//        btnItem.setClickable(false);
        return convertView;
    }
}