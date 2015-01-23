package de.tud.kp.geoguessrcast.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;

import de.tud.kp.geoguessrcast.R;

/**
 * Created by Kaijun on 23/01/15.
 */
public class CityChoiceAdapter extends BaseAdapter {
    private String[] mChoices;
    private LayoutInflater mLayoutInflater;

    public CityChoiceAdapter(String[] choices, Context context) {
        mChoices = choices;
        mLayoutInflater = LayoutInflater.from(context);
    }

    public int getCount() {
        return mChoices.length;
    }

    public Object getItem(int position) {
        return mChoices[position];
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(int position, View convertView, ViewGroup parent) {

        convertView= mLayoutInflater.inflate(R.layout.fragment_button_list_item, null);
        Button btnItem = (Button) convertView.findViewById(R.id.button_list_item);
        btnItem.setText(mChoices[position]);
//        btnItem.setClickable(false);
        return convertView;
    }
}