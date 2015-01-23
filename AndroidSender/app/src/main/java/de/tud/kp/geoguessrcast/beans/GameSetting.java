package de.tud.kp.geoguessrcast.beans;

/**
 * Created by Kaijun on 22/01/15.
 */
public class GameSetting {
    private static GameSetting mInstance = null;

    private GameMode[] gameModes;
    private GameProfile[] gameProfiles;
    private GameMode selectedGameMode;
    private GameProfile selectedGameProfile;

    private GameSetting() {
    }

    public static GameSetting getInstance(){
        if(mInstance == null)
        {
            mInstance = new GameSetting();
        }
        return mInstance;
    }

    public GameMode[] getGameModes() {
        return gameModes;
    }

    public void setGameModes(GameMode[] gameModes) {
        this.gameModes = gameModes;
    }

    public GameProfile[] getGameProfiles() {
        return gameProfiles;
    }

    public void setGameProfiles(GameProfile[] gameProfiles) {
        this.gameProfiles = gameProfiles;
    }

    public GameMode getSelectedGameMode() {
        return selectedGameMode;
    }

    public void setSelectedGameMode(GameMode selectedGameMode) {
        this.selectedGameMode = selectedGameMode;
    }

    public GameProfile getSelectedGameProfile() {
        return selectedGameProfile;
    }

    public void setSelectedGameProfile(GameProfile selectedGameProfile) {
        this.selectedGameProfile = selectedGameProfile;
    }
}
