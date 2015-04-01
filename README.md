GeoGuesserCastReceiver
======================

License
=======

The code is open source. ....

TODO: Licencse

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

- GameModeManager:  
- GameRoundManager: 
- EventManager: 
- RenderManager:
- DataManager:
- ExecutionManager:
- UserManager:


Event Bus Architecture:

- Admin Message Bus:
- Game Message Bus:
- User Message Bus:

Data Sources:

- Google Fusion Tables:

The app
-------


known bugs
----------



