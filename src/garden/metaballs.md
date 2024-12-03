---
title: Metaballs
layout: garden
status: evergreen
planted: 2023-05-11T05:36:20Z
tended: 2024-11-13T02:38:28Z
---

An early goal in the development of [Untitled Algebra Game](/projects/untitled-algebra-game) was to visualize exponents as cells since [mitosis](https://en.wikipedia.org/wiki/Mitosis) translated well to exponent math.

Cells have a sort of goopy-ness that I figured I'd only be able to achieve with a custom shader. Since I historically I've only been able to hack together minimal shaders, I thought I was headed down a rabbit hole of frustration, but it ended up being very straightforward! Most of my time was spent tweaking it to achieve the our specific goals. 

The first thing I stumbled across was [this tutorial](http://patomkin.com/blog/metaball-tutorial/) on implementing these curious things called [metaballs](https://en.wikipedia.org/wiki/Metaballs). Ironically these apparently were modeled after mitosis.

However I ended up poking around a bit more, as I wanted to create a shader with [Shader Graph](https://unity.com/features/shader-graph) because:
1. I figured the non-engineers on my team might want to tweak what I came up with.
2. I wanted to take advantage of Shader Graph handling the quirks of different GPUs since we needed to support a range of different platforms.
3. I couldn't get the shader from the tutorial working out of the box 😅

I didn't find a metaball Shader Graph, but I did find this [gold nugget](https://forum.unity.com/threads/shader-graph-outline-metaball-effect.642427/#post-4306375), which helpfully included a screenshot of their node configuration. I took their advice and googled [Signed Distance Fields](https://en.wikipedia.org/wiki/Signed_distance_function), and fun fact, this is what [TextMeshPro uses to render sharp fonts](https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/FontAssetsSDF.html).

After a day or two of fiddling with nodes, I had a working metaball shader 🎉

![Gif of metaballs working in the Unity Editor](/projects/untitled-algebra-game/sag-metaball-shader-behind-the-scenes.webp)

Unfortunately my programmer art was never replaced and the cells still have the ugly purple base texture 🙈

<!-- TODO: can I share the shadergraph? -->
<!-- TODO: metaball layers that don't interact -->