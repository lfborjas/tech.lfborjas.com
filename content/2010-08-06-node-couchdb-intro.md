+++
title = "Hacking it up with node.js and couchdb"

[taxonomies]
tags = ["node.js", "couchdb", "javascript"]
+++

Yesterday, while being super-productive in my [main project](http://escolarea.com), I stumbled upon (pun intented) [thingler](http://thingler.com/34d09f43300014afff4bd428d77376c1) and [realie](http://www.web2media.net/laktek/2010/05/25/real-time-collaborative-editing-with-websockets-node-js-redis/), both of which made me say "holy mackerel, this [node.js](http://nodejs.org/) hype looks extra rad!" So a fellow dev and I decided to start a little project to learn this awesome stuff. Maybe sometime in a future in a possible universe I'll post more about that.

Node.js has two major niceties: **it brings javascript to the server side** thus allowing developers to stop being bilingual -and thus never quite good in one language or the other- and focus on being extra proficient in one language for both server and client sides. And two, **is totally asynchronous!** non-blocking and truly multiple threaded. 

CouchDB, is a schema-less, no-sql, waddayacallit database server: instead of being relational and having tables and structures and whatnot, it stores JSON strings representing objects. Thus, your javascript prowess can even be applied to the database! RAD.

<!-- more -->


Yet we are used to web frameworks, and we felt that we needed at least a templating system. We're leaning toward [express](http://expressjs.com/) because it allows templates in [haml](http://haml-lang.com/) with the [hamljs module](http://github.com/visionmedia/haml.js) and, while we were at it, decided to take [less](http://lesscss.org/), the css with steroids, for a spin with the [less.js](http://github.com/cloudhead/less.js) module. Express feels nice, though the documentation is kinda weird (being that is sometimes inconsistent and totally incomplete). 

A comparison of frameworks can be found [here](http://ccnmtl.columbia.edu/compiled/reviewed/nodejs_frameworks_review.html) and a nice tutorial on node.js and express (though it uses mongodb), [here](http://howtonode.org/express-mongodb). 

You should check node.js out, feels like _the future_!
