package com.gpldroid.ptpdf;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setBuiltInZoomControls(false);
        web.setWebViewClient(new WebViewClient());
        web.loadUrl("file:///android_asset/web/index.html");
    }
    @Override public void onBackPressed() {
        WebView w=(WebView)findViewById(android.R.id.content).findViewById(android.R.id.content);
        super.onBackPressed();
    }
}
