---
title: Game Genome Project
layout: genome-project/note
status: seedling
---

The _Game Genome Project_ is a sort-of research project of mine with [the mission of identifying and cataloging "genes"](notes/the-project) in video games. I've separated this project into its own "plot" to keep it more focused on it's [specific purpose](the-project).

## Recently tended
<ul>
  {% for page in collections.recentlyTended limit: 5 %}
  <li><a href="{{ page.url }}">{{ page.data.title }} - {{ page.data.tended | timeSince }}</a></li>
  {% endfor %}
</ul>