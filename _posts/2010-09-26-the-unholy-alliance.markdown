---
layout: post
title: The unholy alliance, discovering a command line java interpreter
tags: [linux, java, scripting]
time: 01:24
---

I'm gonna give a little talk about java to some people in a couple of days. Yes, *java*, the new cobol, the language I secretly know, lest I'm banished from the cool kids club. But it has cool stuff. The java virtual machine, the bytecode compiling, the support for unicode and the blessed jruby. I mean, we can run [ruby on appengine](http://code.google.com/p/appengine-jruby/) thanks to java! So get that frown off your face and let me tell you 'bout something cool.

Remember that talk I was talking about before falling into an apologetic digression? Well, I'm writing a slideshow in [showoff](http://github.com/schacon/showoff) so people can follow it on the internerd and maybe fork it for their own teaching ends.I have some example code in java, which I intend to show in a demo to clarify some concepts (namely, inheritance and polymorphism). At first I thought of writing a `main` and then saying "see, we compile this and run this and stuff appears on the terminal, cool huh?". But python, javascript and ruby have spoiled me. I wanted interaction. I didn't want the public saying "but, what if we change so and so, huh, HUH?" and me saying "oh, lets just open the main again, and write and compile and run and hope I didn't forget a semicolon". No. I wanted an interpreter. I wanted to write `javashell` or something of the sort and hack the hack and walk the walk, writing a line and pressing enter and watching the outcome and bowing gently as the crowd bursted in applause at my hello worlds.

But you can't do that in java. Or can you?

Why, yes, you can! I asked my good friend [the duck](http://duckduckgo.com) for a java interpreter and I found about this awesome project called [beanshell](http://www.beanshell.org/). So I installed and did some nerd magic and lived happily ever after.

Just kidding, I'm not gonna be a jerk and end the history here, no sir, Imma tell you how I got my long desired `javashell` with excruciating detail:

1. Downloaded [the latest version](http://www.beanshell.org/download.html) and copied it to a directory where I store apps.
2. Added the `jar` to my `CLASSPATH` so the `java` command and all java code can have some of the magic of beanshell by adding the following to my `~/.bashrc` (so it's there forever, like love): `export CLASSPATH=$CLASSPATH:$HOME/$APPS_DIR/bsh-2.0b4.jar` .
3. Now, as [it's written](http://www.beanshell.org/manual/bshmanual.html#Download_and_Run_BeanShell) the command `java bsh.Interpreter` fires up the interpreter in command line. But that's so verbose, so *java*... So I ran `sudo echo 'java bsh.Interpreter' > /usr/local/bin/javashell; sudo chmod +x /usr/local/bin/javashell` to have the command `javashell` available forever, like in my wildest guilty java dreams.

But the fun doesn't end there!

As the [manual says](http://www.beanshell.org/manual/bshmanual.html#Remote_Server_Mode) you can provide a beanshell in a locally served page. That's right, kids: I'll be able to tell the people at my talk "so, wanna try this out, alright, open a browser and go to whatever.local.ip:1234 and test the code yourself, thanks very much". 

Can you imagine what teachers that -for some unfathomable reason- teach java could do with beanshell? Well, the kind of things that ruby teacher could do with [tryruby](http://tryruby.org/) I guess: having totally interactive classes! (Altough tryruby has an individual interpreter for each connected client and the beanshell server is actually the same instance for all, which is like really dangerous, so use with caution, and a helmet, and maybe an underprivileged user in your OS, but also cool as instances and classes are shared).

Thus ends the story of my unholy foray into the uml-smitten world of java. 'Twas lots of fun, after all.
