---
layout: post
title: Catharted.info, a node.js experiment
tags: [node.js, express, haml, sass]
time: 3:28
---

Let's go and rant a little somewhere.

So, I released to the wild today an experimental little site: [catharted info](http://www.catharted.info) . The rules there are simple: rant a little, read other rants, watch them disappear forever. The source is open and you're free to browse it in [the github repository](http://github.com/lfborjas/catharted).

My reasons for building this site were two: 

**Have a place for occasional ranting**: oftentimes I've found myself wanting to say something, to *broadcast* something just to get it off my chest, like a complaint or a very offensive joke or remark. But let's face it, even in those dire times, when we dare not say what we want to anyone, we'd like the secret satisfaction of knowing that it would not be a total scream into the void if we say it to ourselves, someone, somewhere, must hear it too. And it would be cool also that that someone doesn't know us by our voice, so we don't have to face the sour regret of the consequences. 
Being an internet citizen, a frequent web traveler and a lover of the written media, I have always wanted a place just like that: broadcast stuff with no regrets, a venting site, the internet's pillow. So, being bored and sleep deprived, instead of googling for it, I made it, thus fulfilling this need of mine and also my second purpose:

**Experiment with node.js in the wild**: I'm working on a formal node.js project, but I wanted to see how hard it was to create a little site and deploy it. So I set up to it. First I'll talk about the deployment, because the development is longer and would probably bore you guys.

**The deployment story**

First and foremost, my total investment so far has been of **three bucks**: the .info domain names are on sale on namecheap and a some really cool dude is offering free [VPS servers for node.js developers](http://blog.nodejshost.com/) for the hosting. Maybe later he'll charge me for it, or I'll have to use one of the linode instances I have access to, but, for now, I rolled up the site in less than a week's worth of late-nights and put it up the internerd for less than a beer's price. Not that I drink, though.

This was the most obscure phase, as I found lots of alternatives: some people say that you should use [upstart](http://howtonode.org/deploying-node-upstart-monit), others, that you should use [spark](http://howtonode.org/deploying-node-with-spark), some others, that you should do [weird stuff that bored me while reading](http://bigbangtechnology.com/post/installation_configuration_deployment_node.js_applications_on_media_temple) . 

After all, what you want is two things:  _to have a way to run the node process as a dæmon and automatically reload it when crashing_ and _to have a way to have access to the node server via a normal web server_. It would also be nice to have a way of redirecting the standard output and standard error streams to a log file. 

I went with the [fastest solution](http://dailyjs.com/2010/03/15/hosting-nodejs-apps/) : using nginx for reverse proxying and monit, for not letting the process crash.

**The development story**


If you've never heard about [node.js](http://nodejs.org/), go check it out now. I can wait. 

Did you check it out? Isn't it mega rad? You didn't? Ok, no problem, let me summarize it for you: ___non-blocking, event based, low-resource consuming server technology. Also, server side javascript, that's right, with it you don't have to think in two languages for client/server development___

I created  the app with the [express.js framework](http://expressjs.com/). It's inspired by [sinatra](http://www.sinatrarb.com/), the simple framework for ruby and built over the [connect middleware stack](http://senchalabs.github.com/connect/). I must say that the documentation is a little obscure or lacking sometimes, but it must be that I am spoiled by the [django documentation](http://docs.djangoproject.com/en/1.2/), which is like super complete. I had a hard time with some stuff, like getting post requests to work and error handling. For the former, after poking around in some projects, I discovered that I needed a middleware to decode the body of the post requests, so I added `app.use(connect.bodyDecoder());` to the server code in the app and that was that. For error handling, I followed the [example](http://github.com/visionmedia/express/blob/master/examples/pages/app.js) in the author's github repository, but that only did it for server errors, I'm still quite at loss as how to manage Not found errors. Oh, and those [examples](http://github.com/visionmedia/express/tree/master/examples) are handy, check 'em out.

The main reason for using a framework was that I like templates for my pages. And I am a new convert to [haml](http://haml-lang.com/) (though I still don't know how to do inline markup -stuff like `<p>you know <em>this</em> kinds of things`). For that, I found that there were two haml implementations for javascript, [haml.js](http://github.com/visionmedia/haml.js) and [haml-js](http://github.com/creationix/haml-js). The author of the former is also the express.js framework author, and he says his version is better and has some numberly looking numbers to prove it, so I believed him. But, alas, if you install haml.js with [npm](http://github.com/isaacs/npm) (the node package manager) the command would be `sudo npm install hamljs` so in your express apps you'd have to set the engine to hamljs, not haml -with something like this `app.set('view engine', 'hamljs');`- and also name your templates with the extension .hamljs instead of .haml. If you install with [kiwi](http://github.com/visionmedia/kiwi), though, there shouldn't be a problem because the command would be `kiwi install haml`.

Also, for stylesheets I used [sass](http://sass-lang.com/), because I liked the idea of having functions, mixins  and variables. I'm aware that there are [node.js modules for sass](http://github.com/visionmedia/sass.js/tree/), but I just used the command line utility, 'cause I don't like to do stuff client side *every time* that I could perfectly do *one* time, server side.

For the client side, I used [jquery](http://jquery.com/), 'cause I used it like forever and it's the [fastest for DOM queries](http://mootools.net/slickspeed/)


So, check it out and rant a little. Or start your own node.js development adventure, it's fun!

Also, if it crashes or you kinda hate it, let me know, after all nothing done in a couple of days is flawless.
