var game;
var WORLD_BORDER = 30; // 세계 경계의 논리적 크기 
var SCL = 20; // 셀 하나의 크기

function set30mul(num){ // 주어진 num보다 작으면서 가장 큰 30의 배수 반환
  num = parseInt(num);
  return num - (num%30);
}

function randInt(num){
  return parseInt(random(num));
}

class Dot {
  constructor(){
    if(arguments.length == 3){ // x, y, color
      this.loc = createVector(arguments[0], arguments[1]);
      this.color = arguments[2];
    }
    if(arguments.length == 2){ // vector, color
      this.loc = arguments[0].copy();
      this.color = arguments[1];
    }
  }
  
  show(){
    fill(this.color);
    rect(this.loc.x*SCL, this.loc.y*SCL, SCL, SCL);
  }
}

class Food extends Dot {
  constructor() {
    super(randInt(30), randInt(30), '#FFFFFF');
  }

  eaten(){
    this.loc.set(randInt(30), randInt(30));
  }
}

class Foods {
  constructor(num){
    this.foodArray = Array.from({ length: num }, () => new Food()); // num 길이의 Food() 배열 생성
  }

  get array(){
    return this.foodArray;
  }

  show(){
    this.foodArray.forEach(food => food.show());
  }
}

class SnakeBody extends Dot {
  constructor(){
    if(arguments.length == 2){ // x, y
      super(arguments[0], arguments[1], '#00CC00');
    }
    if(arguments.length == 1){ // vector
      super(arguments[0], '#00CC00');
    }
  }

  collideWithSnakeBody(snakeBody){
    if(this.loc.dist(snakeBody.loc) == 0){
      return true;
    }
    return false;
  }

  collideWithFood(food){
    if(this.loc.dist(food.loc) == 0){
      return true;
    }
    return false;
  }

  collideWithBorder(){
    if(this.loc.x >= WORLD_BORDER || this.loc.y >= WORLD_BORDER || this.loc.x < 0 || this.loc.y < 0){
      return true;
    }
    return false;
  }

  move(speed){
    this.loc.add(speed);
  }

  newMovedBody(speed){
    return new SnakeBody(this.loc.copy().add(speed));
  }
}

class Snake {
  constructor() {
    this.bodyArray = [];
    this.bodyArray.push(new SnakeBody(5, 5));
    this.speed = createVector(1, 0);
    this.lastKey = RIGHT_ARROW;
    this.lastBody = null;
    this.sfxEat = loadSound('assets/coin.mp3');
    //this.sfxDie = loadSound('assets/death.mp3');
  }

  get head(){
    return this.bodyArray[0];
  }

  get tails(){
    return this.bodyArray.slice(1);
  }

  update(){ // 앞부분에 새로운 요소 추가하고 마지막 요소 떼어내기
    this.bodyArray.unshift(this.head.newMovedBody(this.speed));
    this.lastBody = this.bodyArray.pop();
  }

  collideWithSnakeBody(snakeBody){
    return this.head.collideWithSnakeBody(snakeBody);
  }

  collideWithFood(food){
    return this.head.collideWithFood(food);
  }

  collideWithBorder(){
    return this.head.collideWithBorder();
  }

  eat(){ // lastBody에 기억하고 있던 마지막 요소 추가
    this.sfxEat.stop();
    this.bodyArray.push(this.lastBody);
    this.sfxEat.play();
  }

  die(){ // 머리만 남김
    this.lastBody = null;
    this.bodyArray.length = 1;
    this.speed.set(0, 0);
    this.lastKey = null;
    //this.sfxDie.play();
  }

  dieBorder(){ // 머리를 직전위치로 옮김
    if(this.bodyArray.length == 1){ // 이미 머리만 남았으면 따로 처리
      this.bodyArray.length = 0;
      this.bodyArray.push(this.lastBody);
      this.lastBody = null;
      this.speed.set(0, 0);
      this.lastKey = null;
      return;
    }
    this.bodyArray.unshift(this.bodyArray[1]); // 2번째 body를 머리로 만들고 die()
    this.die();
  }

  keyPressed(){
    this.lastKey = keyCode;
  }

  control(){
    if (this.lastKey == UP_ARROW && !this.speed.equals(0, 1)) {
      this.speed.set(0, -1);
    } else if (this.lastKey == DOWN_ARROW && !this.speed.equals(0, -1)){
      this.speed.set(0, 1);
    } else if (this.lastKey == RIGHT_ARROW && !this.speed.equals(-1, 0)){
      this.speed.set(1, 0);
    } else if (this.lastKey == LEFT_ARROW && !this.speed.equals(1, 0)){
      this.speed.set(-1, 0);
    }
  }

  show(){
    this.bodyArray.forEach(body => body.show());
  }
}

class Game {
  constructor(){
    this.foods = new Foods(3);
    this.snake = new Snake();
    this.bgm = loadSound('assets/main.mp3');
    this.bgm.setLoop(true);
  }

  keyPressed(){
    this.snake.keyPressed();
  }

  control(){
    this.snake.control();
  }

  update(){
    this.snake.update(); // 이동 먼저 하고 충돌체크함
    if(this.snake.tails.some(tail => this.snake.collideWithSnakeBody(tail))){
      this.snake.die();
    }
    for(var food of this.foods.array){
      if(this.snake.collideWithFood(food)){
        food.eaten();
        this.snake.eat();
      }
    }
    if(this.snake.collideWithBorder()){
      this.snake.dieBorder();
    }
  }

  show(){
    this.foods.show();
    this.snake.show();
  }
}

function preload() {
  game = new Game();
}

function setup() {
  createCanvas(constrain(set30mul(windowHeight*0.66), 150, 600),constrain(set30mul(windowHeight*0.66), 150, 600));
  SCL = width/30;
  frameRate(15);
  
  game.bgm.play();
}

function windowResized() {
  resizeCanvas(constrain(set30mul(windowHeight*0.66), 150, 600),constrain(set30mul(windowHeight*0.66), 150, 600));
  SCL = width/30;
}

function draw() { // frameRate마다 작동
  background(0);
  game.control();
  game.update();
  game.show();
}

function keyPressed() {
  game.keyPressed();
}