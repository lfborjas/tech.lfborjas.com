(function(){
    function guid(){
        var S4 = function S4(){
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function send(fname, ary){
        var retval=[];
        for(var i=0; i<ary.length; i++ ){
            retval.push(ary[i][fname]());
        }
        return retval;
    }

    var Gist = new function(){

        this.persist = function(key, gist){
          localStorage.setItem(key, JSON.stringify({
              title: gist.title,
              categories: send("toLowerCase", gist.categories.split(/\s*,\s*/)),
              content: gist.content,
              created_at: new Date()
          })); 
          return localStorage.getItem(key);
        };

        this.search_by_category = function(category){
            var results = [];
            var key, item;
            console.log(localStorage.length);
            for(var i=0; i< localStorage.length; i++){
                key = localStorage.key(i);
                item = JSON.parse(localStorage.getItem(key));
                if (item.categories.indexOf(category.toLowerCase()) != -1){
                    results.push(key);
                }
            }
            return results;
        };

        this.display = function(key){
            item = JSON.parse(localStorage.getItem(key));
            item.created_at = new Date(item.created_at);
            updateCategories(item.categories);
            return "<li class='gist' data-key='"+key+"'>"
                    +item.title.split(/\s+/).slice(0,3).join(" ").concat("...")
                    +"<span class='date'> "
                               +item.created_at.toLocaleDateString()
                               +"(at "+item.created_at.toLocaleTimeString()+")</span></li>";
        }

        this.setExample = function(){
            if(!localStorage.getItem("example")){
            this.persist("example",
                    {title: "Example",
                     categories: "example, javascript",
                     content: "Here's _some_ **markdown** and <pre><code>@notes.each{|n| puts n}</pre></code> `code`"
                    });
            }
        }

    }


    function updateCategories(ary){
        if(typeof ary == "string"){
            ary = send("toLowerCase", gist.categories.split(/\s*,\s*/));
        }
        for(var i=0;i<ary.length;i++){
            if(!$("#categories option[value='"+ary[i].toLowerCase()+"']").length){
                $("#categories").append("<option value='"+ary[i]+"'>"+ary[i]+"</option>");
            }
        }
    }

    function displayAll(){
        var item;
        var key; 
        $("#gists").empty();
        for(var i=0; i< localStorage.length; i++){
            key = localStorage.key(i);
            $("#gists").append(Gist.display(key));
        }
    }

    $(function(){
       $("#display").hide();
       $("textarea").elastic();
       Gist.setExample();
       converter = new Showdown.converter();

       if(!Modernizr.localstorage) {
        alert("This browser lacks localstorage, sorry");
        return;
       }
       if(localStorage.length > 0){
           displayAll();
       }
       
       $(".gist").live('click', function(e){
        tgt = $(e.target);
        if(!tgt.is("li")){
            tgt = tgt.parent();
        }
        var gist = JSON.parse(localStorage.getItem(tgt.data("key")));
        $("#edition").hide();
        $("#display").show();
        $("#note").html(converter.makeHtml(gist.content));
        $('pre code', $("#display")).each(function(i, e) {hljs.highlightBlock(e)});    
       });
       $("[name='title']").focus(function(){
        $(".error").remove();
       });
       $("#edition").submit(function(e){
        e.preventDefault();
        if($("[name='title']").val() == ""){
            $("[name='title']").before("<span class='error'>Can't be blank</span>");
            return false;
        }
        var key = guid();
        Gist.persist(key, {title: $("[name='title']").val(), 
                                      categories:  $("[name='categories']").val(),
                                      content:  $("[name='content']").val()});
        $("#categories").val("Todas");
        displayAll();
        $("[name='title'], [name='categories'], [name='content']").val("");
       });

       $("#add").click(function(e){
        e.preventDefault();
        $("#edition").show();
        $("#display").hide();
       });

       $("#categories").change(function(){
           if($(this).val()=="All"){
            $("#prompt").text("All notes");
            displayAll();
            return;
           }
           $("#gists").empty();
           var cats = Gist.search_by_category($(this).val());
           console.log(cats);
           $("#prompt").text("Notes with the category '"+$(this).val()+"'");
           for(var i=0; i<cats.length;i++){
            $("#gists").append(Gist.display(cats[i]));
           }
       });
    });
})();
