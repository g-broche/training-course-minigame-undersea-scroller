# About the project

This repo is part of a training course and relates learning javascript, OOP and DOM manipulations. With the task was to create a small javascript game.

The idea for this project is inspired by the Vtuber Shigumano (しぐまの) who has a theme related to the sea animal called clione.
As such the project had to be water themed and a sprite looking like the Vtuber was to be featured. The concept of swimming while battling enemies (marine life inspired machines) immediately came to mind as fitting with the theme.

Visual assets used for the various sprites are self-made.

## Gameplay

Player controls are displayed below game area and on screen instruction will guide you through the process. Currently only keyboard inputs are supported.

The player must survive for as long as possible by dodging enemy attacks while also preventing any enemy from reaching the left side of the screen which would cause instant defeat.

There are some invincibility frames after taking any damage.
Colliding with an enemy will cause a flat damage being taken regardless of enemy type.

Most of the time was spent creating the logic but the difficulty hasn't been widely tested and is subject to change depending on testing and feedback.

There are (currently) three types of enemies:
* Chargers : will move toward the left while shooting in a straight line. Average health, speed and attack.
* Sharpshooters : Static enemies that will aim toward the player. Low health, immobile but high damage and aiming.
* Tanks : Move very slowly toward the left, has high health, shoots slow but bigger and more damaging projectile.

While the location of the spawn is random along the height of the right side of the game area, the type of enemy being spawn is deterministic. Chargers will spawn by default, sharpshooters will appear every three spawns and tanks every five spawns. In case of conflicting number (ie: 15), tanks are given the higher priority and will be the type spawning.

## Things to improve given more time

* Currently the collision algo between entity is based around square hitbox around the entities which causes some inconsistency especially on wider size elements.
* Tweaking difficulty after more play testing, possibility of reducing start difficulty and then ramping it up over time through higher spawn rates or movement multipliers.
* Possibility of drops with power up items for the player.

## The future

Making a small scale fan game related to the Vtuber i support is something that has been on my mind for a couple years, so when the game brief was presented during the training course it was natural to do a project like this one.

However this repo is pretty much intended as a proof of concept and definitely not the fan game i will do if the opportunity arise. For the proper fan game i would want something of a way higher quality which would require a lot of time that i don't currently have on top of using something more intended for the task (possibly Flutter) and needing proper visual assets.