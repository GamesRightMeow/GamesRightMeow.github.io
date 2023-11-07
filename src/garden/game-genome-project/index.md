---
title: Game Genome Project
layout: page
---

The _Game Genome Project_ a specialized a [digital garden](notes/digital-garden) with [the mission of identifying and cataloging "genes"](notes/the-project) in video games.

## Recently tended
<ul>
  {% for page in collections.recentlyTended limit: 5 %}
  <li><a href="{{ page.url }}">{{ page.data.title }} - {{ page.data.tended | timeSince }}</a></li>
  {% endfor %}
</ul>