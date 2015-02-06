package de.tud.kp.geoguessrcast.adapters;

/**
 * Created by Kaijun on 06/02/15.
 */

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;

import de.tud.kp.geoguessrcast.R;


import android.widget.TextView;

import de.tud.kp.geoguessrcast.beans.Highscore;
import de.tud.kp.geoguessrcast.beans.User;
import de.tud.kp.geoguessrcast.utilities.Utility;

/**
 * Created by Kaijun on 23/01/15.
 */
public class HighscoreListAdapter extends BaseAdapter {
    private Highscore[] mHighscores;
    private LayoutInflater mLayoutInflater;
    private Context mContext;

    public HighscoreListAdapter(Highscore[] highScores, Context context) {
        mHighscores = highScores;
        mContext = context;
        mLayoutInflater = LayoutInflater.from(context);
    }

    public int getCount() {
        return mHighscores.length;
    }

    public Object getItem(int position) {
        return mHighscores[position];
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(int position, View convertView, ViewGroup parent) {

        convertView= mLayoutInflater.inflate(R.layout.highscore_list_item, null);
        TextView highscorePlace = (TextView) convertView.findViewById(R.id.highscore_place);
        TextView highscoreName = (TextView) convertView.findViewById(R.id.highscore_name);
        TextView highscorePercent = (TextView) convertView.findViewById(R.id.highscore_percent);

        highscorePlace.setText(String.valueOf(position+1));
        highscoreName.setText(String.valueOf(mHighscores[position].getName()));
        highscorePercent.setText(String.valueOf(mHighscores[position].getPointsPercent()));

        if(mHighscores[position].getUserMac().equals(User.getInstance().getUserMac())){
            convertView.setBackgroundColor(mContext.getResources().getColor(R.color.entryBackground));
        }

        return convertView;
    }
}