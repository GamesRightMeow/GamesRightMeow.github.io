---
title: Suborbital Salvage Changelog
header: Suborbital Salvage Changelog
layout: page
---

This changelog is for the [Playdate version of Suborbital Salvage](https://play.date/games/suborbital-salvage/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 1.2.0 (02/11/26)

## Added
- Added 15 achievements.
- Added an assist mode that allows you to tune difficulty. However when enabled, achievement unlocks and leaderboard submissions are disabled.
- Added assist mode notification popup.
- Added a more persistent dialog for teaching spin boosts.
- Added warning about starting a run without a tutorial.
- Added explicit back button to settings menu.

## Changed
- Boosts from rings and spins are not as strongly affected by gravity anymore.
- Game settings and save data are now saved to two separate files.
- Improved settings menu layout.
- Game now defaults crank offset setting to "forward".
- Double points (10 instead of 5) are awarded for flying thru a ring backwards.
- Down-mixed all audio to mono to save ~50% disk space (was ~16mb, now ~8mb).

## Fixed
- Fixed oversized colliders on some asteroids.
- Fixed being unable to escape fish's maw.
- Fixed various typos in dialog.
- Fixed music not playing if set below 5 when starting a run.

# 1.1.1 (03/14/25)

## Added
- Added settings menu with the following options:
  - Adjust music volume.
  - Adjust SFX volume.
  - Enable/disable cat dialog.
  - Choose the crank angle which is considered forward for your ship.
  - Invert crank rotation.
- Added icon on game over to indicate score upload status.
- Added game update popup with QR code to this changelog page.
- Added system menu option to quit to menu during run.

## Changed
- Made tip dialogs more likely to appear for new players.
- Allow use of the DOWN+B abandon run shortcut to work in game over cat dialog.

## Removed
- Removed the music toggle from the system menu.

# 1.0.2 (02/24/25)
## Fixed
- Fixed a bug that could be exploited allow for easier runs.

# 1.0.1 (02/12/25)
## Fixed
- Fixed e0 startup crash on devices that have less available storage space.

# 1.0.0 (02/11/25)
Launch build 🚀