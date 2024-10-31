let player;
let playerSprites;
let spriteImage;
let roomExample;
let world;

function preload() {
    spriteImage = loadImage('assets/sprites/player.png')
    roomExample = loadJSON('assets/rooms/room_example.json')
}

function setup() {
    let canvas = createCanvas(640,480);
    canvas.parent("canvasholder");
    noSmooth();

    playerSprites = new SpriteSheet(spriteImage,16,16);
    world = new WorldMap(roomExample, 32);
    player = new Entity(playerSprites, world);

    player.x = width/2;
    player.y = height/2;
}

function draw() {
    background(0);
    world.draw();
    player.draw();
    if (keyIsDown(UP_ARROW)    || keyIsDown(87)) { player.move(0,-1); }
    if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) { player.move(0,1);  }
    if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) { player.move(-1,0); }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { player.move(1,0);  }
}

function websiteInput(index) {
    if (index == 0) {
        let elem = document.getElementById("infoshow");
        if (elem.style.display === "none") { elem.style.display = "block"; }
        else { elem.style.display = "none"; }
    }
}