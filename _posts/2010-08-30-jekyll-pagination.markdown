---
layout: post
title: Pagination in jekyll
tags: [jekyll, pagination]
time: 00:43
---

I migrated my personal site to [jekyll](http://github.com/mojombo/jekyll) today, as I said before; for my blog, I wanted something simple, [codinghorror](http://www.codinghorror.com/blog/), simple and yet a little simpler than that: I don't like the clutter of sidebars and footers, but there had to be a way for people to navigate amongst my entries (I also don't assume that people have the best internet connection ever to load all my posts in one page).

So, I set up to enable pagination. At first, I was worried that almost none of the [listed sites](http://wiki.github.com/mojombo/jekyll/sites) used it, but then I stumbled with [this gist](http://gist.github.com/227621) and it was indeed easy. You see, by adding `paginate: true` to your `_config.yml` jekyll will load a new variable in your templates: `paginator`, with it, you can get the current, previous and next page numbers (among [other things](http://wiki.github.com/mojombo/jekyll/template-data)). And when building your site, the engine will group your posts in folders corresponding to their page, so the posts for page 2 would be at `/page2` etc. 

This jekyll thing is really great, the [liquid template language](http://www.liquidmarkup.org/) feels like django and, if you've hacked some, is really easy to get used to (I've been using it for a couple of hours and I think I don't feel lost anymore). I'd love to see [haml](http://haml-lang.com/) templating, though.

