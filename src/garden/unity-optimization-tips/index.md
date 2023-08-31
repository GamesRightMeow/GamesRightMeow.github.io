---
title: Unity optimization tips
tags: garden
layout: garden
status: seedling
planted: 2023-05-16 16:50:59
tended: 2023-08-28 17:50:04
---

I've picked up an odd assortment of knowledge for squeezing the most performance out of games. I very rarely work on the newest, most capable hardware so I've spent a lot of time finding ways to accomplish the ambitious goals of designers and artists.

While there are common patterns, every game is different. It's important to [understand the unique performance problems](/garden/unity-analyzing-performance) in your game first before making decisions on where to focus your attention.

## Avoid UnityEngine.Object comparisons when possible
[UnityEngine.Object comparisons are expensive](https://blog.unity.com/technology/custom-operator-should-we-keep-it)! This applies to null checks and dictionaries since they both compare the objects internally. A one off comparison here and there is okay, but doing it hundreds of times per frame is going to hit FPS, especially on lower end hardware (like the Nintendo Switch).

⛔ Don't null check a `GameObject` every frame:
```C#
GameObject collisionObject;
void OnCollisionEnter(Collision c)
{
    collisionObject = c.gameObject;
}

void Update()
{
    if (collisionObject != null)
    {
        // handle collision
    }
}
```

✅ Do set a simple boolean flag that you can check each frame:
```C#
bool hasCollided;

void OnCollisionEnter(Collision c)
{
    hasCollided = true;
}

void Update()
{
    if (hasCollided)
    {
        // handle collision
    }
}
```

## Cache expensive methods
The following are methods/properties that you often learn to rely on as a beginner, but many tutorials don't explain that calling them many times per frame can have an impact on your performance. It's best to call these once, and locally cache the results. 

- Camera.main
- GameObject.transform
- Renderer.Material
- Transform.Find
- FindObjectOfType/FindObjectsOfType/FindObjectOfTypeAll 

⛔ Use `Camera.main` every `Update()`:
```C#
void Update()
{
    var cam = Camera.main;
    cam.transform.Translate(Vector3.forward * Time.deltaTime);
}
```

✅ Cache the result in `Awake()`, `Start()`, or `OnEnable()` once, and reference the result in `Update()`:
```C#
Camera cam;

void Awake()
{
    cam = Camera.main;
}

void Update()
{
    cam.transform.Translate(Vector3.forward * Time.deltaTime);
}
```

<!-- TODO: article on why you shouldn't use Transform.find -->

## Leverage data locality
[This article on data locality and the impact of cache misses](https://gameprogrammingpatterns.com/data-locality.html), but essentially: putting things next to each other in memory is going to make your CPU work less hard.

Arrays are faster than Lists.

How do you apply this?

<!-- FIXME: elaborate -->

## Use fewer shaders
Simply accessing Renderer.material will assign a new instance of the material. If assigning shader properties, use [MaterialPropertyBlocks](https://docs.unity3d.com/ScriptReference/MaterialPropertyBlock.html) instead.

Each shader is another set of draw calls. And if you don't have GPU instancing enabled, each instance is also drawn separated instead of being combined into a batch.

## Use integer ids
There’s a few instances where Unity allows integer and string ids in their API. The string APIs are often used by they are much less performant than their int counterparts, such as: 
- Global shader properties or material properties [Shader.PropertyToId](https://docs.unity3d.com/ScriptReference/Shader.PropertyToID.html)
- Animator parameters [Animator.StringToHash](https://docs.unity3d.com/ScriptReference/Animator.StringToHash.html)

<!-- FIXME do and dont -->