package de.tud.kp.geoguessrcast.customWidgets;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.widget.SeekBar;

/**
 * Created by Kaijun on 26/03/15.
 */
public class SeekbarWithLabel extends SeekBar {

    public SeekbarWithLabel(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    Drawable mThumb;

//    @Override
//    public void setThumb(Drawable thumb) {
//        super.setThumb(thumb);
//        mThumb = thumb;
//    }
//
//    public Drawable getSeekBarThumb() {
//        return mThumb;
//    }
}
