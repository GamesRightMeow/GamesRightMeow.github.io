---
title: Unity optimization tips
layout: garden
status: budding
planted: 2023-05-16T05:36:20Z
tended: 2024-07-19T22:48:08Z
---

I've picked up an odd assortment of knowledge for squeezing the most performance out of games. I very rarely work on the newest, most capable hardware so I've spent a lot of time finding ways to accomplish the ambitious goals of designers and artists.

While there are common patterns, every game is different. It's important to [understand the unique performance problems](/garden/unity-analyzing-performance) in your game first before making decisions on where to focus your attention.

## Avoid UnityEngine.Object comparisons when possible
[UnityEngine.Object comparisons are expensive](https://unity.com/blog/engine-platform/custom-operator-should-we-keep-it)! This applies to null checks and dictionaries since they both compare the objects internally. A one off comparison here and there is okay, but doing it hundreds of times per frame is going to hit FPS, especially on lower end hardware (like the Nintendo Switch).

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

⛔ Don't use `Camera.main` every `Update()`:
```C#
void Update()
{
  var cam = Camera.main;
  cam.transform.Translate(Vector3.forward * Time.deltaTime);
}
```

✅ Do cache the result in `Awake()`, `Start()`, or `OnEnable()` once, and reference the result in `Update()`:
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

<!-- TODO: GRM article on why you shouldn't use Transform.find -->

## Leverage data locality
When you leverage data locality by putting related data next to each other in memory, you increase performance because the data can be accessed more quickly. For more information about how this works, refer to [this article](https://gameprogrammingpatterns.com/data-locality.html).

<!-- TODO: practical examples? -->

## Prefer arrays over lists when possible
Use arrays over lists whenever possible. A good rule of thumb is if the list doesn't need to grow dynamically at runtime, it probably should be an array.

The reason being is that elements in an array are stored contiguously in memory where as elements in a list are not. Does this sound familiar? This concept is explained in the previous tip on [data locality](#leverage-data-locality).

## Use manager classes
Unity's "magic methods" (e.g. `Update()`, `Awake()`, etc) don't come free. One particular one to note is the `Update()` method. Normally the cost is negligible, but if you have [thousands of instances of a script you're going to notice it](https://unity.com/blog/engine-platform/10000-update-calls). The optimization here is to move the update to a single manager class, which also happens to leverage the previous tip on [data locality](#leverage-data-locality).

⛔ Don't have many (i.e. hundreds) instances of a component with an Update() method
```C#
public class MyBehaviour : MonoBehaviour
{
  void Update()
  {
    // do something
  }
}
```

✅ Do have a single manager class that calls a custom update
```C#
public class MyBehaviour : MonoBehaviour
{
  public void ManagedUpdate()
  {
    // do something
  }
}

public class MyBehaviourManager : MonoBehaviour
{
  public MyBehaviour[] behaviors;

  void Update()
  {
    foreach (var behavior in behaviors)
    {
      behavior.ManagedUpdate();
    }
  }
}
```

## Don't leave empty Update() methods in your scripts
Unused function normally are harmless, but leaving an empty `Update()` function in a script particularly one that has thousands of instances will consume a non-trivial amount of CPU time. Even though its empty, Unity still needs to spend the effort calling that function.

Unfortunately is very common to see empty `Update()` functions because of the default script template. You can add a [custom default script template](https://support.unity.com/hc/en-us/articles/210223733-How-to-customize-Unity-script-templates) that has the `Update()` method removed.

## Use fewer shaders
Simply accessing Renderer.material will assign a new instance of the material. If assigning shader properties, use [MaterialPropertyBlocks](https://docs.unity3d.com/ScriptReference/MaterialPropertyBlock.html) instead.

Each shader is another set of draw calls. And if you don't have GPU instancing enabled, each instance is also drawn separated instead of being combined into a batch.

## Use integer ids
There's a few instances where Unity allows integer and string ids in their API. The string APIs are often used by they are much less performant than their int counterparts, such as: 
- Global shader properties or material properties [Shader.PropertyToId](https://docs.unity3d.com/ScriptReference/Shader.PropertyToID.html)
- Animator parameters [Animator.StringToHash](https://docs.unity3d.com/ScriptReference/Animator.StringToHash.html)

## Use the correct import settings
The default import settings are usually not the most optimal. I high recommend reading [this two part blog](https://blog.theknightsofunity.com/wrong-import-settings-killing-unity-game-part-1/) about choosing the right import settings for your assets.