---
title: Nodoku Post Mortem
subtitle: A new kind of numbers game
date: 2018-05-20
tags: 
  - post
  - video-games
  - post-mortem
layout: post
---

Nodoku is the first _commercial_ game I've worked on solo. It was meant to kickstart an indie game studio, but it ended up becoming the start of finding a much needed creative outlet. The game is available on [Itch](https://gamesrightmeow.itch.io/nodoku) (and previously Google Play before I couldn't keep up with Google's updates to app requirements). I launched the game relatively quietly because I didn't want to focus on making money but rather just making the games that I want to make.

## What Went Right

### Small project

To avoid the common indie pitfall of spending years on a passion project to ultimately have it fail, I adopted what I've been calling as the "fail fast" mindset. I focused on only the core mechanics and backlogged any complex ideas that popped up during development. I feel like for Nodoku specifically, it forced me to embrace the minimalist puzzle game theme fully.

### Acknowledging I have no idea how to market a game

While I've been a game developer for over ten years now, I've never had to deal with the business side of things. I had my friend [Brandon Pittser](mailto:pittser140@gmail) help me with figuring out how to market the game as well as generating copy for the app store. While I ultimately ended up quietly launching my game, his advice throughout was invaluable. If anyone else needs help with marketing he's open to helping out!

### Unity Events

While I've been developing games in Unity for about three years now, I had been avoiding [UnityEvents](https://docs.unity3d.com/Manual/UnityEvents.html).  
After finishing Nodoku however, I feel like I've been missing out on the true power of Unity. Being able to change what a button does in the editor without touching a line of code definitely made things easier and faster to do.

There's [plenty](https://jacksondunstan.com/articles/3335) [of](https://www.reddit.com/r/Unity3D/comments/35oekm/delegate_events_vs_unityevent_which_one_is/) [threads](https://answers.unity.com/questions/1358219/update-vs-delegate-events.html) that argue against the use of UnityEvents. While the issues pointed out _are_ valid, I don't think they are a problem unless you're trying to squeeze every last drop of performance out of your game. Personally I think being able to quickly iterate on ideas is far more important.

The one thing that bothered me however was that there isn't an native solution for searching for references of a function used in the editor. My solution was to hack together my own tool to search for uses. It was well worth the time spent and I'll eventually be releasing it to the asset store once I get it cleaned up.

**2020 Follow up**: _I've been meaning to add this little addendum for awhile now: Unity Events are great for quick prototyping and ultra small games with a single developer (e.g. Nodoku). Since releasing Nodoku, I tried using Unity events in several projects, but I quickly realized that they scale terribly and you tend to end up with the Unity Editor equivalent of spaghetti code._

### Material design

I have a limited background in art, so I decided to follow Google's [Material Design](https://material.io/) principles when creating the look for Nodoku. Because Material design is already an established look, I didn't risk creating something that people wouldn't like the look of. I was able to quickly make simple shapes in [Inkscape](https://inkscape.org/) or use free icons from [FontAwesome](https://fontawesome.com/) instead of sinking hours into more complex art with my limited skills.

### Planning with Zenkit

I'd been using [Trello](https://trello.com/) for a long time to organize things from shopping lists to planning vacations. However I was never quite satisfied with the way Trello did things. Its great for simple todo lists, but it really breaks down when you want to view the data in different ways. Thankfully [Zenkit](https://zenkit.com/) came to the rescue with much needed features like custom properties and different views.

### Teaching through discovery

I've always hated implementing tutorials in games, so I wanted to experiment and see if I could make a game that included zero instructions but still be playable. Based on the feedback so far, I think I have succeeded in this regard. During playtests most people only took 3-5 minutes to figure out the core mechanic. Leaving text out of the game also had the added benefit of not having to localize the game, meaning it was available in all languages without any extra work.

## What Went Wrong

### Creating a procedural level puzzle before basic gameplay

When I first started the project, I dove into creating a procedural puzzle system before I had even designed a few hand made puzzles to test basic mechanics. I had sunk about four days into it before I realized I didn't even know what levels I was trying to coax the system into generating. In retrospect this seems like an obvious bad decision, but I had really wanted to make a game that would generate puzzles that I as the developer didn't know the solution to.

### iOS support

I sunk about two days into getting an iOS build pipeline setup before I realized my old 2009 Mac Mini couldn't make builds for the latest OS. It was primarily my mistake assuming that the Mini could produce builds and focusing on automating the process right away, but I also want to blame Apple for having an unnecessarily complex process for getting games on their devices.

### Google Play internal vs closed beta testing

The Google Play developer console doesn't make it obvious that the beta testing track forces your testers to pay for your app. I only realized this after sending out invites to my testers, so I ended up generating promocodes for everyone and emailing them one by one. Then the next day I found that you could do an _internal_ test that not only made the game free to testers but also made updates immediately available. Doh.

### Trying to make a profit

While I was aware that I had no experience with the business side of games, I hadn't realized how painfully uninterested I was in doing it. I ended up getting really bogged down with mundane things I needed to do in order to get the app up for sale. Combined with my available time being limited to 8 hours a week due to a new job the rollout slowed to a crawl. I had intended to release Nodoku the beginning of March but didn't end up releasing it until May. I don't think anything in particular was difficult to do, but the time and effort required to do it was time and effort I'd rather spend making games. Ultimately, I think this realization was super important to me so it was totally worth it.
