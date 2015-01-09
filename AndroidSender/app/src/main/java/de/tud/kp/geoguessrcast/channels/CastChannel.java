package de.tud.kp.geoguessrcast.channels;

import android.util.Log;

import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.CastDevice;

import de.tud.kp.geoguessrcast.MainActivity;
import de.tud.kp.geoguessrcast.R;

/**
 * Created by Kaijun on 08/01/15.
 */
public class CastChannel implements Cast.MessageReceivedCallback {

    private MainActivity mainActivity;

    CastChannel(MainActivity mainActivity){
        this.mainActivity = mainActivity;
    }
    /**
     * @return custom namespace
     */
    public String getNamespace() {
        return "";
    }

    /*
     * Receive message from the receiver app
     */
    @Override
    public void onMessageReceived(CastDevice castDevice, String namespace,
                                  String message) {
        Log.d(this.mainActivity.TAG, "onMessageReceived from AdminChannel: " + message);
    }


}
