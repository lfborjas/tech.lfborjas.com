+++
title = "Uploading pdfs to google docs via the gdata python api client"

[taxonomies]
tags =  ["gdocs", "python"]
+++

And remain sane and alive
------------------------------------+++

Here's the deal, the [Google docs API](http://code.google.com/intl/es/apis/documents/) is really neat, if you can [dance oauth](http://www.slideshare.net/episod/linkedin-oauth-zero-to-hero). But, by allowing to do all that crazy stuff with documents is bound to be really complicated -just read that xml, is like something only robots should ever gaze at!.
But the nice guys over at google have developed some client libraries, and one of those is the [gdata python client library](http://code.google.com/apis/documents/docs/1.0/developers_guide_python.html). Which combines all that power with the python inherent simplicity.

But there's a _caveat_: there's so much stuff that the documentation is sometimes outdated or just plain wrong, as is the case with pdf uploads via the version 1.0 of the API. They [would swear](http://code.google.com/intl/es/apis/documents/faq.html#WhatKindOfFilesCanIUpload) that you can upload pdf files. But no, you can't, not with old versions of the client nor with the latest release (at least as of the writing of this post, the version 2.0.11).

So, let's just show our users a message that says "oops, bummer, no can do". 

Or not. 

<!-- more -->


We're working on a project that integrates with google docs were possibly 90% of the user document uploads will surely be pdf files. So something had to be done.

After a couple of days of swearing and trying kinda hard, we found a solution, or something like that.

First, there was [this thread in google groups](http://code.google.com/p/gdata-issues/issues/detail?id=591#c77) that says you should alter the code to force it to use the version 3 of the api (instead of the default, which is the version 1). ___but___ that resulted in a `invalid request uri` error, which we solved with this somewhat [hacky hack](http://www.google.co.uk/support/forum/p/apps-apis/thread?tid=4555f0bcae380766&hl=en) which basically consists of changing the URIs of the docs to adhere to the standard in the new API version.  

And voilà, like a hacked up frankenstein, we got pdf uploads working in the gdata python client. And a little grudge against google, because that bug has been there for like two and a half years! (so we suspect that it can't be that easy to solve, so expect a future post on how everything went to hell, I guess).

So that was it, a line to add the API version header and another to change the folder URI and life shone again.

*UPDATE*: here's a gist with the patch: <https://gist.github.com/759173>
