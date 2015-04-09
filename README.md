GeoGuesserCastReceiver
======================

License
=======

Copyright (C) 2015  TU Dresden

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, see <http://www.gnu.org/licenses/>.

User Documentation
=================
GeoGuessrCast is an app for playing a game of geo guessing with your friends. All you need is a Android phone and a Chromecast. 
The app is available inside the Google Play Store (Todo Link). 

After connecting with your chromecast, one player will be the admin and can choose between the different types of geo guessing.
The given city or country to guess is showed on the screen connected to the chromecast and you can type or select your answer on your android phone.

During game creation, you can choose between:

- 2 Game Modes: "Country Guessing" and "City Guessing" can be combined with different Gaming Profil options on different difficulty levels
    - "City Guessing": Try guessing the showed city on the map.
    - "Country Guessing": Try guessing the showed country on the map.
- Gaming Profils:
    - Free Choice: freely type in the name of the given city or country on your phone, nearest guess gets most points
    - Multiple Choice: choose the right city or country between possible answers, only the right answer gets points
    - Pointing Mode: you get to see the name of the city or country on the screen and point on the map on your phone to the location, nearest guess gets most points
- Level of difficulty: You can seemlessly choose between a lower level and higher level of difficulty inside the android app
    - slider between low and high: changes difficulty based on e.g. country or city population
    
- Highscores:
    - percentage based on your expected points during the game, in harder game modes, you get higher ratings, in lower game modes, lesser ratings
    - Session Highscore: shows the current gaming session highscore
    - All-Time Highscore: shows the all time gaming session highscore from all games played
    
- Custome Game Setting:
    - Game mode settings for experts
    
Developer Documentation
======================

We are happy for every contribution to this project.
It consists of two main part: the android app and the chromecast receiver. The Architecture is build on message events sent between those two components.

The chromecast receiver
-----------------------
Manager Architecture:

- GameModeManager:  starts, stops game rounds, sets difficulties and applys them to the game profil.
- GameRoundManager: handling of game rounds, like evaluation of answers
- EventManager: handling of incoming events from the android app
- RenderManager: handles rendering of the game ui, e.g. shows on screen messages during game
- DataManager: handles database connection for fusion table, creates neccessary geo objects for the game rounds, saves/loads user highscores
- ExecutionManager: enables the app to use multi-threading in javascript
- UserManager: handles all user information during the game

Event Bus Architecture:

- Admin Message Bus: all configuration related are on here
- Game Message Bus: all game events, e.g. game started, all android clients are notified
- User Message Bus: all user related events, e.g. user anserws, users joining/leaving

Data Sources:

- Google Fusion Tables: 
    - Country Data: https://www.google.com/fusiontables/data?docid=1BuyI_S9TNtXhs_iOg4wwvaL1COJK_tM6UYN5drbF#rows:id=1
    - City Data: https://www.google.com/fusiontables/DataSource?docid=1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os#rows:id=1

The app
-------
- Managers:
  * `EventRequestManager`: provided methods for all requests of ChromeCast events.
  * `GameManager`: has delegations of EventRequestManager and Activity, handles the main logic of the game.
  * `ProfileBarManager`: handles the initialisation and updating of profile bar at bottom of screen.
- Activities:
  * `WelcomeActivity`: handles the connection to ChromeCast device, as well as the User informations.
  * `GameActivity`: controlles the main game flow, it registered an event listener for CastManager, and GameManager responds to the events sended by Web-App. It will responsively replace the current fragment according to the arrived events.
  * `About Activity`: about the App
  * `Licence Activity`: Licence of the App, shown in Webview
- Fragments:
  * `FreeChoiceModeFragment`: handles the main logic of specific game mode(free choice mode). it sends the the answer given by user to the Web-App, then it's replaced by WaitRoundFragment. Additionally it contains also a Timer with vibration.
  * `MultipleChoiceModeFragment`: as above, similar
  * `PointingModeFragment`: as above, similar
  * `ChooseModeFragment`: generated dynamically with the datas received from Web-App. it is shown in listView with adapter.
  * `ChooseProfleFragment`: as above, similar
  * ......
  
- Beans:
  * `GameMessage`: a class for creating request message or persisting messages received from Web-App. it's jsonified/parsed by using a library called `Gson`.
  * `User`: a ***singleton*** for creating/updating/persisting informations of user
  * ......
  
- Utilities:
  * `DeviceInfo`: provides methods for acquiring username of device(by splitting Gmail username) and mac address of device.
  * `TimerWithVibration`: encapsulated CountDownTimer with vibration and customised settings
  * `Utility`: other help functions
  
- External Libraries used:
  * [`CastCompanionLibrary-android`](https://github.com/googlecast/CastCompanionLibrary-android)
  * [`FloatingActionButton`](https://github.com/futuresimple/android-floating-action-button)
  * [`Material Dialogs`](https://github.com/afollestad/material-dialogs)
  * [`AndroidCountryPicker`](https://github.com/roomorama/AndroidCountryPicker) (source code modified)
  * [`DiscreteSeekBar`](https://github.com/AnderWeb/discreteSeekBar)
known bugs
----------

- sometimes app is not connecting right to the chromecast
- random disconnects from the chromecast



