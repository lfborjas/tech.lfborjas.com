---
layout: post
title: Turning into rageguy, python and the UnicodeDecodeError
tags: [python, django]
time: 18:01
---

My main projects are in Django, and I've become accustomed to developing in english. But my main audience speaks spanish. So crazy stuff happens when other people test my apps and we see, astonished and enraged, a  `UnicodeDecodeError`. In fact, I took a picture of myself when such an error occurred:

![UnicodeDecodeRage][rageguy]

So I've oft dived into the unfathomable depths of google to search for a solution to no avail. **Until now**. 

In a comment of an obscure blog a friend was reading in the neighbor's cat netbook, we came across
this little line of code:

`sys.setdefaultencoding(name)`

But not too fast, kimosabe!

Before you go importing sys everywhere and pasting that. Read the python documentation: _"This function is only intended to be used by the site module implementation and, where needed, by sitecustomize. Once used by the site module, it is removed from the sys module’s namespace."_

That means that when you try to import it, *it won't be there*. Because it's [really really dangerous](http://tarekziade.wordpress.com/2008/01/08/syssetdefaultencoding-is-evil/) and you should be doing conversions back and forth from `str` to `unicode`. But I've been there, done that, and still that error lurks in my nightmares.

If you fear not those dreadful conventions, You can reload the module and use it (perhaps in a module that gets imported once, like `urls.py` or `models.py` in a django project) :

`import sys; reload(sys);sys.setdefaultencoding('utf-8') `

There you go, a hackish solution for a ridiculous problem.

[rageguy]: http://i235.photobucket.com/albums/ee282/brainimpalement/rageguy.gif "PYYYYTHOOON"
