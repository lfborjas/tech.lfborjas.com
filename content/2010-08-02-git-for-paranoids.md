+++
title = "Git for paranoids"

[taxonomies]
tags =  ["git", "backups"]
+++

<p>So, git, I assume you're familiar with it -if not, take a look at <a title="Git homepage" target="_blank" href="http://git-scm.com/"> this</a> and <a title="Readings about git" target="_blank" href="http://gitready.com/"> this</a> - . Those of you familiar with it may also be familiar with <a title="Github homepage" target="_blank" href="http://github.com/">Github</a>, the awesome git hosting service. And those of you who may have used github long enough, are thankful for being able to rest assured that your code will be on a reliable server and never, ever, get lost, even if you computer catches fire and then is stole by ghosts.</p> 
<p>But, what happens when <a title="Github error" target="_blank" href="http://www.flickr.com/photos/robhudson/4058660340/"> the unicorn strikes</a>? Those very rare moments when something happens and github is down. With your code. Presumably when you most need to push or pull changes. That stuff happens, it's the law of nature, and not even a super rad site like github is exempt from some downtime, you know that. <strong>But what about your code?</strong></p> 
<p>I came up with some kind of solution for my projects, and no, it's not to store it in a usb every five seconds or having a magical RAID, it's just probability: for my really important projects, you can simply create backup repositories in other git hosting websites!</p> 
<p>I usually have two options beside github: <a title="Codaset: another git hosting site" target="_blank" href="http://codaset.com/">Codaset</a> and <a title="Gitorious: yet another git hosting site" target="_blank" href="http://gitorious.org/">Gitorious</a>. And both have their advantages and disadvantages:</p> 

<!-- more -->


<ul> 
<li>Codaset lets you create free private repositories, yet in github, you pay for that. But it's like impossible to fork a project, at least is not as straightforward as in github</li> 
<li>Gitorious has different semantics for repositories: you create a <em>project</em> and in it, the repositories; so it's weird and its good or bad, depending on tastes</li> 
</ul> 
<p>So, alright, you can create those repositories easily. But how do you <em>manage</em> three repositories from your project folder? Easy, two words:</p> 
<pre>git remote</pre> 
<p>Let's say you have a project called "HelloRadWorld", and created repositories in all three sites. Github probably would be your first, and, if you followed the instructions provided there, you'd have entered this command somewhere:</p> 
<pre>git remote add <strong>origin</strong> git@github.com:You/HelloRadWorld.git</pre> 
<p><br /> See what you did there? You added a remote repository and named it "origin". Nice. You'll do the same for the other ones! Easy as pi! Let's see how it goes:<br /> For your codaset repository, for example, you'll add the following:</p> 
<pre>git remote add <strong>codaset_backup</strong> git@codaset.com:You/HelloRadWorld.git</pre> 
<p><br /> And something similar for the gitorious one. Presto, you have now three repositories to pull and push from with commands like git push/pull codaset_backup master. But <em>pushing</em> to all three of them could get tedious, so I got one extra trick for you: create an alias in your git config. I usually create a push alias called "all", so I can push to all the repositories in one command (like</p> 
<pre>git push all master</pre> 
<p>For pulls, I don't like the idea of downloading three of the same, so I don't configure the alias for that.</p> 
<p>All of this configuration gets done in the file .git/config in your project folder, and it would look like this:</p> 

```bash
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
[remote "origin"]
    url = git@github.com:you/HelloRadWorld.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[remote "gitorious_backup"]
    url = git@gitorious.org:you/HelloRadWorld.git
    fetch = +refs/heads/*:refs/remotes/backup/*
[remote "codaset_backup"]
    url = git@codaset.com:you/HelloRadWorld.git
    fetch = +refs/heads/*:refs/remotes/backup/*
#an alias you can only push to:
[remote "all"]
    url = git@github.com:you/HelloRadWorld.git
    url = git@gitorious.org:you/HelloRadWorldgit
    url = git@codaset.com:you/HelloRadWorld.git
```

<p>So there you go, git for paranoids, now, what are the odds of your computer catching on fire <em>and</em> all the servers in those three sites exploding. A hint: <strong>It's still not zero</strong> (isn't math lovely?)</p>
