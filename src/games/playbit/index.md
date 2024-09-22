---
title: Playbit
header: Playbit
layout: game
cover: /games/playbit/playbit-logo.webp
---
Playbit is a framework for creating cross-platform Playdate games from a single Lua codebase. To accomplish this, it has two key components:

- A reimplemention of the [Playdate API](https://sdk.play.date/Inside%20Playdate.html) in [Love2D](https://love2d.org/).
- A build system that utilizes [LuaPreprocess](https://github.com/ReFreezed/LuaPreprocess/) to strip/inject platform dependent code.

{% include "image" url: "/games/playbit/playbit-demo.webp" alt: "Gif demonstrating Playbit launching a game in the Playdate simulator and desktop at the same time." %}

# Why should you use Playbit?
If you're looking for a framework for creating cross-platform Playdate games from a single Lua codebase, then that's Playbit's primary goal!

However Playbit's features also can help improve your workflow when working on Playdate-only games too. For example:

- [Builds scripts](https://github.com/GamesRightMeow/playbit/blob/main/docs/build-scripts.md) allow you to create automated build configurations. Do you have a separate demo build and paid build? Create a separate build script for each!
- Process assets at build-time with [file processors](https://github.com/GamesRightMeow/playbit/blob/main/docs/file-processors.md) to generate more performant versions e.g. work directly with [Aseprite (.aseprite)](https://www.aseprite.org/) to retain layers, tags, and other features and then auto-generate PNGs at build-time.
- Compile out blocks of code with [preprocessor flags](https://github.com/GamesRightMeow/playbit/blob/main/docs/core-concepts.md#preprocessor-flags) that aren't relevant for builds e.g. add development tools to test builds without adding bloat to your final production builds.
- Write more performant and maintainable code e.g. instead of calling math.abs(num) in a performance critical area (function calls can add up!) you can inline the method with a [macro](https://github.com/GamesRightMeow/playbit/blob/main/docs/core-concepts.md#macros).

Additionally, if you're not creating a cross-platform game, all Playdate SDK functions are available to you since Playbit doesn't need to emulate them for Love2D.

# Further reading
- [Github project](https://github.com/GamesRightMeow/playbit)
- [Documentation](https://github.com/GamesRightMeow/playbit/tree/main/docs)