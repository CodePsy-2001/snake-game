var s;
var foodArray;
var eatDetector;
var scl = 20; // 셀 하나의 크기

function set30mul(_num){ // 주어진 num보다 작으면서 가장 큰 30의 배수 반환
  _num = parseInt(_num);
  return _num - (_num%30);
}

function setup(){
  "use strict";
  createCanvas(constrain(set30mul(windowHeight*0.66), 150, 600),constrain(set30mul(windowHeight*0.66), 150, 600));
  scl = width/30;
  
  s = new Snake();
  foodArray = [];
  
  foodArray.push(new Food());
  foodArray.push(new Food());
  foodArray.push(new Food());
  
  eatDetector = new EatDetector();
  
  frameRate(10);
}

function windowResized() {
  resizeCanvas(constrain(set30mul(windowHeight*0.66), 150, 600),constrain(set30mul(windowHeight*0.66), 150, 600));
  scl = width/30;
}


function draw() {
  background(0);
  s.death();
  s.update();
  s.show();

  foodArray.forEach(food => food.show());
  foodArray.forEach(food => eatDetector.detect(s, food));
}

var lastkey = RIGHT_ARROW;
function keyPressed() {
  if (keyCode === UP_ARROW && lastkey !== DOWN_ARROW) {
    s.dir(0, -1);
    lastkey = keyCode;
  } else if (keyCode === DOWN_ARROW && lastkey !== UP_ARROW){
    s.dir(0, 1);
    lastkey = keyCode;
  } else if (keyCode === RIGHT_ARROW && lastkey !== LEFT_ARROW){
    s.dir(1, 0);
    lastkey = keyCode;
  } else if (keyCode === LEFT_ARROW && lastkey !== RIGHT_ARROW){
    s.dir(-1, 0);
    lastkey = keyCode;
  }
}

function EatDetector() {
  "use strict";
  this.detect = function(snake, food){
    console.log(snake.x);
    var _d = dist(snake.x, snake.y, food.location.x, food.location.y);

    if (_d == 0) {
      snake.eat();
      food.eaten();
    }
  }
}

function Food() {
  "use strict";
  this.location = createVector(parseInt(random(30)), parseInt(random(30)));

  this.pickLocation = function(){
    this.location = createVector(parseInt(random(30)), parseInt(random(30)));
  }

  this.eaten = function(){
    this.pickLocation();
  }

  this.show = function(){
    fill(242,242,242);
    rect(this.location.x*scl, this.location.y*scl, scl, scl);
  }
}

function Snake() {
  this.x = 5;
  this.y = 5;
  this.xspeed = 1;
  this.yspeed = 0;
  this.total = 0;
  this.tail = [];
  
  this.dir = function(x, y){
    this.xspeed = x;
    this.yspeed = y; 
  }
  
  this.eat = function() {
    this.total++;
  }
  
  this.death = function() {
    for (var i = 0; i < this.tail.length; i++) {
      var pos = this.tail[i];
      var d = dist(this.x, this.y, pos.x, pos.y);
      if (d < 1) {
        this.total = 0;
        this.tail = [];
      }
    }
  }
  
  this.update = function () {
    for (var i = 0; i < this.tail.length-1; i++) {
      this.tail[i] = this.tail[i+1];
    }
    this.tail[this.total-1] = createVector(this.x, this.y);
    
    this.x += this.xspeed;
    this.y += this.yspeed;
    //avoid snake to go out of canvas
    this.x = constrain(this.x, 0, 29);
    this.y = constrain(this.y, 0, 29);
  }
  
  this.show = function() {
    fill(1,254,0);
    for (var i = 0; i < this.total; i++){ // 몸통
     rect(this.tail[i].x*scl,this.tail[i].y*scl, scl, scl);
    } 
    rect(this.x*scl, this.y*scl, scl, scl); // 머리
  }
}