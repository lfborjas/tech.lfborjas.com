+++
title = "Mixed indentation in python, the phantom menace"
[taxonomies]
tags =  ["python", "IDE", "eclipse"]
+++

I was editing some code today in eclipse (yeah, I know, I should be using vim, but I got used to it for django projects).

But a fellow coder apparently did use vim. And had his settings to tab meaning an actual tab, whilst my eclipse settings turn a tab stroke into four spaces.

So hijinks totally ensued!

But it was an easy fix: I used the regular expression replacemente option and replaced every occurrence of four spaces with `\t`

So, there's that.
