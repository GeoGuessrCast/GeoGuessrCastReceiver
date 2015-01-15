package de.tud.kp.geoguessrcast.utilities;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;

/**
 * Created by Kaijun on 14/01/15.
 */
public class Utility {

    public static void hideSoftKeyboard(Activity activity) {
        InputMethodManager inputMethodManager = (InputMethodManager)  activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        try{
            inputMethodManager.hideSoftInputFromWindow(activity.getCurrentFocus().getWindowToken(), 0);
        }
        catch (Exception e){
            Log.e(activity.getClass().getSimpleName(), "Exception while hiding soft keyboard", e);
        }
    }
}
