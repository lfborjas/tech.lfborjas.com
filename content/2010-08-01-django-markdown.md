+++
title = "Markdown in django"
date = 2010-08-01

[taxonomies]
tags =  ["django", "markdown", "python", "javascript"]
+++

<p>Last week, I added markdown support to a little blog engine I wrote for a django tutorial. And well, I accomplished it in minutes! I like markdown because is <em>really</em> easy to write and generates amazing html. It is presented <a href="http://daringfireball.net/projects/markdown/syntax">here</a> and the syntax is explained neatly in <a href="http://stackoverflow.com/editing-help">Stack Overflow</a>, and they use it, too. </p> 
<p>My approach was really simple: I wanted to write the posts in markdown with a preview (like in the question edition in <a href="http://stackoverflow.com">Stack Overflow</a>), store the posts in markdown and display them in html.</p> 

<!-- more -->

<p>So, the steps:<br /> 
</p> 
<ol> 
<li>Install markdown (get it from <a href="http://pypi.python.org/pypi/Markdown/2.0.3">the cheese shop</a> ), if you use app engine, you'll have to copy the <code>markdown</code> folder to your project root.</li> 
<li>Add <code>django.contrib.markup</code> to your <code>INSTALLED_APPS</code></li> 
<li>With your content stored as markdown, to show it in templates, you'll simply have to add tag with<code>load markup</code> at the beginning of your templates and use the <code>markdown</code> filter (like in <code>entry.body|markdown</code> to show entries stored in markdown as html).</li> 
<li>Download <code>showdown.js</code> and copy the minified js to your static files folder. (you can get it from <a href="http://attacklab.net/showdown/">the project homepage</a>)</li> 
<li>In a template for edition, let's say you have a textarea with id <code>id_body</code> and want to show the preview. Well, add a  <code>div</code> -let's call it <code>preview</code> and the following javascript (added somewhere in your <code>&lt;head&gt;</code>.</li> 
</ol> 
<script src="http://gist.github.com/497703.js"> </script> 
 
 <p>And that's it, you have markdown in your app! Don't make humans edit raw html ever again!</p> 
 <p>-More info can be found <a href="http://www.freewisdom.org/projects/python-markdown/Django">here</a></p> 
