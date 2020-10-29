+++

title = "Serendipitron is born"

[taxonomies]
tags = ["python", "gae", "serendipitron", "nlp"]
+++

<p>Serendipitron is my new weekend project; find it here <a href="http://serendipitron.appspot.com">http://serendipitron.appspot.com</a>.</p>

<!-- more -->


<p>It was born as my thesis project in college. The gist of it is to provide an <strong>API</strong> that <em>analyzes</em> content and then <em>recommends</em> links that may be related to it, being then useful to <em>annotate</em> content in web pages or documents or to <em>suggest</em> information that may help writers to get resources that will enhance the quality of their work (by having references that they could not have had the time or the initiative to find on their own) and also <em>learning</em> from it's use to provide <em>personalized</em> and <strong>not generic</strong> recommendations to each user.</p> 
<p>By being an API, <em>anyone</em> can use it <em>anywhere</em>, because they just have to request info to an URL and read the JSON or XML responses.</p> 
<p>As a college project it used the ontology in the <a href="http://dmoz.org">Open Directory Project</a> to classify content and using stuff like <a href="http://pypi.python.org/pypi/topia.termextract/1.1.0">Topia Term Extract</a>, the <a href="http://developer.yahoo.com/search/content/V1/termExtraction.html">yahoo term extraction service</a>, <a href="htpp://tagthe.net/">tagthe</a> and the <a href="http://www.alchemyapi.com/api/keyword/textc.html">alchemy service</a> to get keywords in the content and then search it's document collection to make suggestions, filtered by the preferences that the current user had, so the queries would be less ambiguous.</p> 
<p>But that version needed lots of storage: it had a web crawler that downloaded the documents in the ODP and indexes for full-text search and whatnot. </p> 
<p>This new version will be different, at least at first, it will rely on the collective intelligence already available in sites like <a href="http://digg.com">http://digg.com</a>, <a href="http://delicious.com">http://delicious.com</a> or <a href="http://reddit.com">http://reddit.com</a> to make suggestions and learn user profiles. </p> 
<p>So, if you write a blog or documents or research or whatever and have ever felt the need to find more information <strong>but didn't have the time or didn't know what to search for</strong>, <strong><em>just keep writing and let serendipitron find useful information for you!</em></strong></p> 
<p>Interested? Go to <a href="http://serendipitron.appspot.com">http://serendipitron.appspot.com</a> and let me know!</p> 
