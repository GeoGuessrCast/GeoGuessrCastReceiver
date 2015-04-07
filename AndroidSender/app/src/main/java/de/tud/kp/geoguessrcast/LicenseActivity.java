package de.tud.kp.geoguessrcast;

import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.WindowManager;
import android.webkit.WebView;

/**
 * Created by Kaijun on 07/04/15.
 */
public class LicenseActivity extends ActionBarActivity {

    private WebView webView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        android.support.v7.app.ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayShowHomeEnabled(false);
            actionBar.setDisplayShowTitleEnabled(true);
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setTitle(getString(R.string.pref_licence_label));
        } else {
            setTitle(getString(R.string.pref_licence_label));
        }
        webView = new WebView(this);
        setContentView(webView);
        if (getWindow().isFloating()) {
            WindowManager.LayoutParams layout = new WindowManager.LayoutParams();
            layout.copyFrom(getWindow().getAttributes());
            layout.height = WindowManager.LayoutParams.MATCH_PARENT;
            getWindow().setAttributes(layout);
        }
        webView.loadUrl("file:///android_asset/licenses.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

}