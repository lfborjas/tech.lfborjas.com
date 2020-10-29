+++
title = "Slicing bread with chainsaws, one size doesn't fit all webdev needs"

[taxonomies]
tags =  ["microframeworks", "ruby", "node.js", "sinatra", "rails", "django"]

+++

Ok, world, big fat disclaimer here: I'm not an experienced developer in all of the web frameworks that have existed in the history of ever (I've only done kinda serious stuff in three of 'em) and this thing I'm saying here is more of a hypothesis that I'm currently putting to experience's scrutiny than a rational, exhaustively thought, conclusion. Now, read on.

Nowadays, there are lots of web frameworks, and people have done wonderful stuff with them (twitter was written [initially](http://techcrunch.com/2008/05/01/twitter-said-to-be-abandoning-ruby-on-rails/) with ruby on rails, p.e.). And, truly, they have allowed the now commonplace fast, yet robust and standards compliant, development of big projects. But what about the little projects? Those little apps with at most a couple of tables in a database and a simple service to offer? Well, the really cool and experienced developers just do _that_ in the big frameworks too...

Ay, there's the rub that makes big frameworks of so big a hype.

<!-- more -->

You see, we're used to (and, after all, it was the inception of) big ol' web applications with lots of functionality and storing everything in the universe because in the old days (you know, probably a couple of years ago) *every website was isolated*, little or none applications depended on (or aided) others like now: we have APIs, single sign on protocols, services and whatnot: the web is no more a place for "sites" because now it's full of applications which interact with each other and feed each other, thus evolving into more and more atomic services and mashups. 
And even more, in the mashups world, you could write an entire, useful, web application *almost* entirely with client side code, with your server barely doing more than storing some stuff in a database and serving the files. (Don't believe me? Let's say you want user authentication: [facebook](http://developers.facebook.com/docs/reference/javascript/FB.login) and [twitter](http://dev.twitter.com/anywhere/begin#login-signup)  have pure javascript SSO facilities. You want some real world info? There are the [google ajax apis](http://code.google.com/apis/ajax/) ).

I see, then, at least two cases where a big framework is no more a quick way to do stuff, but becomes _overkill_: when your service - or product - is so atomic that in the server side you have few controllers and models, or when you build a mashup such that you can survive with pure client side code.

In cases like these, I, for one, would never create a [ruby on rails](http://rubyonrails.org/) or [django](http://www.djangoproject.com/) project: you are gonna end up with lots of one liner scripts because there's a threshold when too much *modularity* and strict *separation of concerns* become little more than *bureaucracy*. If your service is a straightforward little one. __Shouldn't the framework you use to write it be the same?__.

That happened to me last night: I wanted to make a little one-weekend-single-geek-hackaton-made project and went for ruby, because, hey, [chunky bacon](http://mislav.uniqpath.com/poignant-guide/). I wanted to give a try to ruby on rails 3 beta *And wasted the whole evening of yesterday dealing with gems and the ruby language versions and magically generated files trying to display a doggone __hello world haml-powered page__*. I conceed to the fanboys that it was my first time on rail's magical elven world. But my application was so little that I was gonna _waste_ more time learning the intricacies of the framework than _actually developing_. I switched to [sinatra](http://www.sinatrarb.com/) this morning (being also my first time with it and my second attempt to programming in ruby) and _had the models and a couple of views and controllers up and running in less than an hour_.  And it's not the first time, my first complete [node.js](http://nodejs.org/) powered [app](http://www.catharted.info/) was also created in a weekend thanks to [a microframework](http://expressjs.com/).

There, I said it. If you develop little applications with big frameworks you're probably lazy or a bureaucrat. Or didn't know that microframeworks existed, like me.
