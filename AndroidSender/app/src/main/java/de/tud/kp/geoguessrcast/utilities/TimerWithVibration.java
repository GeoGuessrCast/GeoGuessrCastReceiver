package de.tud.kp.geoguessrcast.utilities;

import android.app.Activity;
import android.os.CountDownTimer;
import android.os.Vibrator;

/**
 * Created by Kaijun on 14/01/15.
 */

public abstract class TimerWithVibration {
    private CountDownTimer t;
    private long mMilliseconds;
    private int mVibrateSec;
    private Vibrator mVibrator;

    public TimerWithVibration(long millisecond, int vibrateSec, Activity activity){

        mMilliseconds = millisecond;
        mVibrateSec = vibrateSec;
        mVibrator = (Vibrator) activity.getSystemService(activity.VIBRATOR_SERVICE);

        t = new CountDownTimer(mMilliseconds, 1000) {
            public void onTick(long millisUntilFinished) {

                int seconds = (int)millisUntilFinished / 1000;
                int percent = (int)(seconds*100/(mMilliseconds/1000));

                vibratePhone(seconds);
                onTimerTick(seconds,percent);

            }
            public void onFinish() {
                onTimerFinish();
            }
        };
    }

    public abstract void onTimerTick(int sec, int percent);

    public abstract void onTimerFinish();

    public void vibratePhone(int seconds){
        if(seconds==mVibrateSec){
            long[] pattern = {0, 100, 50, 100};
            mVibrator.vibrate(pattern, -1);
        }
    }

    public void cancel(){
        t.cancel();
    }

    public void start(){
        //notify the player that the new round already started!
        long[] pattern = {0, 200};
        mVibrator.vibrate(pattern, -1);

        t.start();
    }

}
