package de.tud.kp.geoguessrcast;

import android.annotation.TargetApi;
import android.app.ActionBar;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceCategory;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.preference.RingtonePreference;
import android.support.v7.app.ActionBarActivity;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;


import java.util.List;

public class AboutActivity extends ActionBarActivity {

    private static final boolean ALWAYS_SIMPLE_PREFS = false;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getSupportActionBar().setDisplayShowHomeEnabled(false);
        getSupportActionBar().setDisplayShowTitleEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle(getString(R.string.about_label));

        getFragmentManager().beginTransaction().replace(android.R.id.content, new AboutFragment()).commit();

    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                onBackPressed();
                return true;

            default:
                return super.onOptionsItemSelected(item);
        }
    }

    public static class AboutFragment extends PreferenceFragment
    {
        @Override
        public void onCreate(final Bundle savedInstanceState)
        {
            super.onCreate(savedInstanceState);
            addPreferencesFromResource(R.xml.pref_about);

            findPreference("pref_version_key").setSummary(buildVersionInfo());



        }

        private String buildVersionInfo() {
            String version = "";
            PackageManager packageManager = getActivity().getPackageManager();
            PackageInfo packInfo = null;
            try {
                packInfo = packageManager.getPackageInfo(getActivity().getPackageName(), 0);
            } catch (PackageManager.NameNotFoundException e) {

            }

            if (packInfo != null) {
                version = packInfo.versionName + "(" + packInfo.versionCode + ")";
            }

            if (!TextUtils.isEmpty(version)) {
                return version;
            } else {
                return "";
            }
        }
    }




}
