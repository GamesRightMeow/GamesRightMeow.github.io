---
title: Unity optimization tips
tags: garden
layout: garden
status: seedling
planted: 2023-05-16 16:50:59
tended: 2023-05-16 19:55:50
---

I've picked up an odd assortment of knowledge for squeezing the most performance out of games. I very rarely work on the newest, most capable hardware so I've spent a lot of time finding ways to accomplish the ambitious goals of designers and artists.

While there are common patterns, every game is different. It's important to [understand the unique performance problems](/garden/unity-analyzing-performance) in your game first before making decisions on where to focus your attention.

## Avoid UnityEngine.Object comparisons when possible
[UnityEngine.Object comparisons are expensive](https://blog.unity.com/technology/custom-operator-should-we-keep-it)! This applies to null checks and dictionaries since they both compare the objects internally. A one off comparison here and there is okay, but doing it hundreds of times per frame is going to hit FPS, especially on lower end hardware (like the Nintendo Switch).

## Cache expensive methods
- Camera.main
- GameObject.transform
- Renderer.Material
- Transform.Find
- FindObjectOfType/FindObjectsOfType/FindObjectOfTypeAll 

## Leverage data locality
Use arrays. [Data locality](https://gameprogrammingpatterns.com/data-locality.html).
Arrays are faster than Lists 

## Use fewer shaders
Simply accessing Renderer.material will assign a new instance of the material. If assigning shader properties, use [MaterialPropertyBlocks](https://docs.unity3d.com/ScriptReference/MaterialPropertyBlock.html) instead.

Each shader is another set of draw calls. And if you don't have GPU instancing enabled, each instance is also drawn separated instead of being combined into a batch.

## Use integer ids
There’s a few instances where Unity allows integer and string ids in their API. The string APIs are often used by they are much less performant than their int counterparts, such as: 
Global shader properties or material properties [Shader.PropertyToId](https://docs.unity3d.com/ScriptReference/Shader.PropertyToID.html)
Animator parameters [Animator.StringToHash](https://docs.unity3d.com/ScriptReference/Animator.StringToHash.html)

<!-- - [Unity Docs: Common Profiler Markers](https://docs.unity.cn/Manual/profiler-markers.html)
- [Unity Docs: Performance Best Practices](https://docs.unity3d.com/Manual/BestPracticeUnderstandingPerformanceInUnity.html)
- [Unity Blog: Tales from Optimization Trenches](https://blogs.unity3d.com/2019/11/14/tales-from-the-optimization-trenches/)
- [Unity Blog: Scripting Optimizations](https://unity.com/how-to/advanced-programming-and-code-architecture?_ga=2.44000994.670872801.1603824943-1950255191.1583262306)
- [Unity Blog: Smart Game Development Pipeline](https://unity.com/how-to/set-smart-game-development-pipeline)
- [Unity Learn: Fixing Performance Problems](https://learn.unity.com/tutorial/fixing-performance-problems-2019-3?uv=2019.3#5e85bbb0edbc2a08897d4839)
- [Unity Learn: UI Optimization](https://create.unity3d.com/Unity-UI-optimization-tips)
- [Fix your Unity Timestep!](https://johnaustin.io/articles/2019/fix-your-unity-timestep)
- [Unity Job System](http://blog.s-schoener.com/2019-04-26-unity-job-zoo/)
- [Job System Tutorial](https://www.raywenderlich.com/7880445-unity-job-system-and-burst-compiler-getting-started)
- [Garbage Collection Tips](https://danielilett.com/2019-08-05-unity-tips-1-garbage-collection/)
- [GameDev Guru: Common optimizations](https://thegamedev.guru/unity-performance-checklist-pro/)
- [Your audio settings are killing your game!](https://blog.theknightsofunity.com/wrong-import-settings-killing-unity-game-part-2/) -->