+++
title = "Ruby jewelry"

[taxonomies]
tags =  ["ruby", "rubygems"]
+++
Yesterday I had no money to go out and the weather sucked. So I decided to pick up [one](http://serendipitron.tumblr.com/) of my side projects and hack for a while.

For that project I need to fundamental components, a way of extracting keywords in a text and a wrapper for the public rss feeds of [delicious.com](http://delicious.com). So I created [webtagger](http://github.com/lfborjas/webtagger) and [deliruby](http://github.com/lfborjas/deliruby) (this morning I thought to rename it to "delirious", which is cooler, but, well, nevermind) and released them as opensource gems for whomever wants to to hack them and use them. I think it's cool to be able to release something easy to use for others (using `gem install` instead of downloading the source, extracting it, installing it and all that fuzz).

So, how *do* you create a gem?

<!-- more -->


Easy! I used [jeweler](http://github.com/technicalpickles/jeweler) to create the gem skeleton and manage it and [rubygems.org](http://docs.rubygems.org/read/chapter/6) to host it, and here's how:

* Create your gem with `jeweler your-gem`
* Edit the `Rakefile` to add the description and dependencies
* Write some tests in the `test/` dir or start coding in the `lib/` dir.
* If you want to provide a binary executable, just add it in the `bin/` dir and declare it in the Rakefile with `gem.executables << your-bin-name`
* When you're ready to deploy the first version, just run `rake version:bump:minor` (more on major-minor-patch versioning [here](http://apr.apache.org/versioning.html) )
* Then, run `rake build` to create the gemspec (`your-gem.gemspec`) and the gem itself (will be created in a `pkg` directory). 
* `cd` to `pkg` and simply run `gem push` the `.gem` file for the version you're releasing and you're done! 

Keep in mind that you need to be subscribed to [rubygems.org](http://rubygems.org/) -don't worry, it's free- and have a version of rubygem greater or equal to 1.3.7
