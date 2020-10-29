//This global variable makes baby jesus cry
var side = 50;

//metaprogramming: alter the Function prototype to have a curry property
/*Currying, in non-functional languajes like JS, means pre-applying arguments to a function
 to use 'em in subsequent calls
 */
//based on: http://javascriptweblog.wordpress.com/2010/04/05/curry-cooking-up-tastier-functions/

Function.prototype.curry = function (){
    if(arguments.length < 1){
        return this; //nothing to curry!
    }
    var __method = this;
    //convert `arguments` to a true Array
    var toArray = function(coll){return Array.prototype.slice.call(coll);};
    var args = toArray(arguments);
    return function(){
       //this function concatenates the curried params with the new ones it gets:
       return __method.apply(this, args.concat(toArray(arguments))); 
    };
};

Object.prototype.values = function(){
  result = [];
  for(key in this){
    if(typeof this[key] != "function")
        result.push(this[key]);
  }
  return result;
};
/*functional programming utils, in a singleton object*/
/*based on: http://spheredev.org/wiki/Higher-order_programming_in_JavaScript*/
lambda = {
    /*apply a callback function to each element in place*/
    forEach : function(collection, action){
               for(var i=0;i<collection.length;++i){
                action(collection[i]);
               }
              },
    /*apply a function to a collection of elements and return the result*/
    map: function(f, collection){
            result = [];
            this.forEach(collection, function(item){
                result.push(f(item));
            });
            return result;
         },
    /*build a collection of elements in the original collection which pass the criterion function*/
    filter: function(criterion, collection){
                result = [];
                this.forEach(collection, function(item){
                    if(criterion(item)){
                        result.push(item);
                    }
                });
                return result;
            },
    /*Call an instance method defined by `proc_name` to each element in the collection*/
    //TODO: accept arguments (use apply)
    send: function(proc_name, collection){
            this.forEach(collection, function(item){
                item[proc_name]();
            });
          },
    /*Add the results of the evaluations of a function over a collection to an accumulator*/
    reduce: function(combine, collection, base){
                this.forEach(collection, function(item){
                    base = combine(base, item);
                });
                return base;
            },
};

//flatten an array: sorta-metaprogramming meets sorta-functional programming
Array.prototype.flatten =function flatten(){
    return lambda.reduce(function(a,b){return a.concat(b)}, this, []);
} 

Piece = function(posx, posy, is_black){
    var radius = 20;
    //return the absolute coordinates of the enclosing box
    this.x = function(){return posx*side};
    this.y = function(){return posy*side};
    this.posx = posx;
    this.posy = posy;
    this.is_black = is_black;
    this.black = "black";
    this.white = "white";
    
    this.draw = function(){
        x =  posx*side;
        y =  posy*side;
        var color = is_black ? this.black : this.white;
        var e = this.canvas.circle(x + side/2, y + side/2, radius).attr({fill: color});
        //webkit has an issue: it needs forced renderings
        //I'm using a generalized version of this method:
        //https://github.com/DmitryBaranovskiy/raphael/issues/issue/230
        this.canvas.safari();
        return e;
    };

    //use the element for removing or repainting and stuff
    this.elem = this.draw();
    this.toggle_color = function(){
        if(this.elem !== undefined){
            this.elem.attr({fill: (this.is_black ? this.white : this.black)});      
            this.is_black = !this.is_black;
            this.canvas.safari();
        }
    };
};

Board = function(canvas_surface){
  //private variables
  this.pieces = {};
  this.side = 50;
  var turn = true;
  this.directions = [[0,1], //down
                [0,-1], //up
                [-1,0], //left
                [1,0], //right
                [1,1], //diagonal down right
                [-1,1],//diagonal down left
                [1, -1], //diagonal up right
                [-1, -1] //diagonal up left
               ];
  var self = this;
  function successor(x, y, direction){
    //all coordinates are absolute, not relative
    return self.get_piece_at(x+direction[0], y+direction[1])
  }
  
  /*Isn't a recursive function prettier? :) (if only JS had tail recursion optimization...) */
  function get_foes(x, y , color, enemies, direction){
    //to overcome a reference problem with currying:
    enemies = (enemies === null) ? new Array() : enemies;
    next = successor(x, y, direction);
    //base cases: if we hit the edge, a blank square or a piece of the same color, stop compiling enemies
    if(next === undefined || (next.is_black == color)){
        return (next === undefined ? [] : enemies);
    }else{ // recursive case: keep looking
        enemies.push(next);
        return get_foes(next.posx, next.posy, color, enemies, direction);
    }
  }
  //public variables
  this.canvas = Raphael(canvas_surface, side*8, side*8);
  this.hints_enabled = false;
  Piece.prototype.canvas = this.canvas;

  this.get_piece_at = function(x, y){
    return this.pieces[x+"_"+y];
  };
  
  this.put_piece= function(piece){
    this.pieces[piece.posx+ "_" +piece.posy] = piece;
  };
  
  /*The most important function: responds to clicks, which determine turns*/
  this.make_movement= function(board_element){
    var attrs = board_element.attr();
    var x = attrs.x/side, y = attrs.y/side;
    //the performance of this bit worries me: try to use caching or memoization
    //because this same function could be called later in show_hints...
    /*if(!this.get_possible_plays(turn).length){
        UI.announce_winner(!turn);
        return;
    }*/
    if(!this.get_piece_at(x,y)){
        //get all foes in all directions: oh, the beauty of higher order procedures!
        var foes = lambda.map(get_foes.curry(x, y, turn, null), this.directions).flatten();
        if(foes.length){
            lambda.send("toggle_color", foes); //tell all foes to change their colours
            this.put_piece(new Piece(x, y, turn));
            UI.update_counter(turn, foes.length);
            turn = !turn;
            UI.toggle_turn(turn);
            if(this.hints_enabled){
                this.show_hints();
            }
        }
    }
  };

  /**Draw the board and bind the click event for the squares*/
  this.draw = function(){
    var self = this; //save the defining scope for usage within the anonymous function
    for(i=0;i<=8;i++){
        for(j=0;j<=8;j++){
            this.canvas.rect(i*side, j*side, side, side)
                .attr({fill: "green"})
                .click(function(e){
                    /*bind this to the click of a board rectangle*/
                    self.make_movement(this);
                });
        }
    }
  };
  
  /*Returns an array of relative coordinates with the possible plays for a given color*/
  this.get_possible_plays = function(color){
    //1. get legal places:
      var self = this;
      var places = lambda.reduce(
                        //get the blank spots adjacent to the given piece
                        function(results, piece){
                            lambda.forEach(self.directions,
                                function(pos){
                                    if(!self.get_piece_at(piece.posx+pos[0], piece.posy+pos[1])){
                                        results = results.concat([ [piece.posx+pos[0], piece.posy+pos[1]], ]);
                                }
                            });
                            return results;
                        }
                        , 
                        //obtain all of the pieces of the opposite color
                        lambda.filter(function(piece){return piece.is_black != color;}, 
                            this.pieces.values())
                        , []);
      //2. get places with valid moves:
      return lambda.reduce(function(results, place){
        var foes = lambda.map(get_foes.curry(place[0], place[1] , color, null), self.directions).flatten();
        if(foes.length){
          results = results.concat([place,]);
        }
        return results;
      }, places, []);
  };
   
  this.show_hints = function(){
    UI.show_hints(turn, self.get_possible_plays(turn), self.canvas);
    return true;
  }
  /**Put the board in it's default state*/
  this.set_default_state = function(){
    this.put_piece(new Piece(3,3,false));
    this.put_piece(new Piece(3,4,true));
    this.put_piece(new Piece(4,3,true));
    this.put_piece(new Piece(4,4,false));
  }
};

/*another type of singleton*/
var UI = new function(){
    this.toggle_turn= function(is_black){
        if(is_black){
            $("#white-prompt").css("color", "gray");
            $("#black-prompt").css("color", "#444");
            $("#pointer").text("→");
        }else{
            $("#black-prompt").css("color", "gray");
            $("#white-prompt").css("color", "#444");
            $("#pointer").text("←");
        }
    }

    this.update_counter= function(is_black, count){
        var este, aquel;
        este = is_black ? "#black-counter" : "#white-counter";
        aquel = is_black? "#white-counter" : "#black-counter";
        $(este).text((new Number($(este).text()))+count+1);
        $(aquel).text((new Number($(aquel).text()))-count);
    }
    this.hints = [];
    this.show_hints = function(color, hints, canvas){
        var self = this;
        this.remove_hints();
        lambda.forEach(hints, function(hint){
            self.hints.push(canvas.rect(hint[0]*side, hint[1]*side, side, side)
                             .attr({fill: (color ? "black": "white"), opacity: 0.35})
                             .mouseover(function(e){this.remove();}));
            canvas.safari();
        });
    }

    this.remove_hints = function(){
        lambda.forEach(this.hints, function(hint){
            hint.remove();
        });
    }
};

$(function(){
    board = new Board("board");
    board.draw();
    board.set_default_state();
    $("#show-hints").click(function(e){
        //taking advantage of the short circuit evaluation powers of the && and ||  operators
        //which works like this in lisp too...
        //if the checkbox is checked, the left hand will evaluate to true and require the
        //show hints function to be called (because AND shortcirtuits with false); if not, it evaluates to false and requires 
        //the remove_this function to be called (because OR shortcircuits with true)
        ((board.hints_enabled = $(this).is(":checked")) && board.show_hints()) || UI.remove_hints();
    });
    $("#play, #about").hide()
    
    $("#play-link, #about-link").click(function(e){
            e.preventDefault();
            $("#"+$(this).attr("id").replace("-link", "")).toggle()
        });
});
