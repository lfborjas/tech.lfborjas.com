Object.prototype.toString = function(){
    var rval = "";
    for(property in this){
        /*if(typeof this[property] === "array"){
            for(var i = 0; i< this[property].length; i++)
                rval += this[property][i].toString()+"\n";
        }
        else*/
        if(typeof this[property] !== "function" && typeof this[property] !== "array"){
            rval += "\t"+ property + ": " + this[property].toString()+"\n";
        }

    }
    return rval;
}

Creature = function(name, properties){
    this.name = name;
   
    for(property in properties){
        this[property] = properties[property];
    }

    this.getHit = function(damage){
        var vor = this.life;
        powerUp = Math.random()*this.charisma + 1;
        if(powerUp % 9 == 7){
            this.life += powerUp/4;
        }
        this.life -= damage;
        //retornar la nueva vida
        return vor - this.life;
    }

    this.fight = function(enemy, weapon){
        if(this.life <= 0) return -1 ;
        weapon = weapon || this.weapon;
        if(weapon.powerUp)
            this.life  += weapon.powerUp;
        
        yourHit = Math.random() * (this.strength + weapon.strength(enemy));
        thehit = enemy.getHit(yourHit);
        return thehit;
    }
};

var hero = new Creature("Rabbit", {
    life : 10,
    strength: 2,
    charisma: 44,
    weapons: {
        sword: {
            powerUp: 10,
            strength: function(e){
                return Math.random()*Math.pow(4 + e.life%10, 2);
            }
        },
        
        bomb: {
            powerUp: -1,
            strength: function(e){
                return 86;
            }
        }
    }
});

var theArray = [
    new Creature("Scuba Argentine", {
        life: 15,
        strength: 35,
        charisma: 91,
        weapon: {powerUp: 0, strength: function(){return 2;}},
        items: { lettuce: {powerUp: 5, strength: function(){return 1;}}}
    }),

    new Creature("Industrial Raver Monkey", {
        life: 30,
        strength: 25,
        charisma: 100,
        weapon: {powerUp: 0, strength: function(){return 2;}},
        items: {boomerang: {powerUp: 7, strength: function(){return 13;}}}
    }),

    new Creature("Dwarven Angel", {
        life: 25,
        strength: 5,
        charisma: 60,
        weapon: {powerUp: 0, strength: function(){return 20;}},
        items: {katana: {powerUp: 15, strength: function(){return (Math.random()*100)+20;}}}
    }),

    new Creature("Assistant ViceTentacle And Ombudsman", {
        life: 30,
        strength: 6,
        charisma: 10,
        weapon: {powerUp: 0, strength: function(){return 20;}},
        items: { lettuce: {powerUp: 5, strength: function(){return 1;}}}
    }),

    new Creature("Teeth Deer", {
        life: 20,
        strength: 40,
        charisma: 2,
        weapon: {powerUp: 0, strength: function(){return 15;}},
        items: { bomb: {powerUp: -1, strength: function(){return 100;}}}
    }),

    new Creature("Intrepid Decomposed Cyclist", {
        life: 40,
        strength: 20,
        charisma: 100,
        weapon: {powerUp: 0, strength: function(){return 25;}},
        items: { bazooka: {powerUp: -5, strength: function(){return 150;}}}
    }),

    new Creature("Dragon", {
        life: 300, //tough scales
        strength: 100, //bristling veins
        charisma: 120, //toothy smile
        weapon: {powerUp: 1, strength: function(){return 200;}}, //fire breath
        items: { lettuce: {powerUp: 5, strength: function(){return 1;}}}
    })
].reverse();
