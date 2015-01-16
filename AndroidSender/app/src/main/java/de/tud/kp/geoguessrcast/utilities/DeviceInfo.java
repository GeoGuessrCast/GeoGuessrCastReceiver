package de.tud.kp.geoguessrcast.utilities;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

/**
 * Created by Kaijun on 14/01/15.
 */
public class DeviceInfo {
    /**
     * get username of this android device
     */
    public static String getDeviceUsername(Context context){
        AccountManager accountManager = AccountManager.get(context);
        Account[] accounts = accountManager.getAccountsByType("com.google");
        if(accounts.length>0){
            String email= accounts[0].name;
            String name = email.split("@")[0];
            return name;
        }
        return "";
    }
    /**
     * get Mac Address of this android device
     */
    public static String getDeviceMacAddr(Context context){
        WifiManager manager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiInfo info = manager.getConnectionInfo();
        String macAddr = info.getMacAddress();
        if (macAddr == null) {
            macAddr = "Device don't have mac address or wi-fi is disabled";
        }
        return macAddr;
    }
}
