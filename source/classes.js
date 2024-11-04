class SpriteSheet { // DATA STRUCTURE FOR SPRITE SHEETS
    constructor(_img, _cx, _cy) {
        this.img      = _img;  // SHEET IMAGE SOURCE
        this.cx       = _cx;   // CELL SIZE X
        this.cy       = _cy;   // CELL SIZE Y
        this.sprites  = [];    // SPRITE DATA
        for (let i = 0; i < this.img.width/this.cx; i++) {
            this.sprites[i] = [i*this.cx, 0, this.cx, this.cy];
        }
    }
}

class Entity { // A MOVABLE CHARACTER
    constructor(_sprites, _worldMap = null) {
        this.x      = 0;                         // ENTITY X POSITION
        this.y      = 0;                         // ENTITY Y POSITION
        this.vx     = 0;                         // ENTITY X VELOCITY
        this.vy     = 0;                         // ENTITY Y VELOCITY
        this.speed  = 4;                         // ENTITY SPEED
        this.sheet  = _sprites;                  // THE SPRITESHEET OBJECT PROVIDED

        if (_worldMap) {
            this.compareTiles = _worldMap.tiles;
        } else {
            this.compareTiles = [];
        }
    }

    draw() {
        let s = []; //  [ 0-sprite-position-x, 1-sprite-position-y, 2-sprite-width, 3-sprite-height ]

        if (this.vx > 0) { s = this.sheet.sprites[2]; }       // MOVING RIGHT
        else if (this.vx < 0) { s = this.sheet.sprites[0]; }  // MOVING LEFT
        else if (this.vy > 0) { s = this.sheet.sprites[1]; }  // MOVING UP
        else { s = this.sheet.sprites[3]; }                   // MOVING DOWN

        image(this.sheet.img, this.x-s[2], this.y-s[3], 32, 32, s[0], s[1], s[2], s[3]);
        fill(255);
        circle(this.x, this.y, 5);
    }

    move(_x, _y) {
        this.vx = _x;
        this.vy = _y;
        this.x += _x * this.speed;
        this.y += _y * this.speed;

        if (this.compareTiles.length > 0) {                         // COLLISION LOGIC
            for (let i = 0; i < this.compareTiles.length; i++) {
                let tile = this.compareTiles[i];

                let m1 = 16 - 1;
                let m2 = 48 - 1;

                if (tile.data.collide == true) {
                    if (this.vx != 0 && this.y <= tile.yW +m2 && this.y >= tile.yW -m1) {
                        if (this.vx > 0 && this.x > tile.xW -m1 && this.x < tile.xW +m1) {
                            this.x = tile.xW - (m1 + 1)
                        }
                        if (this.vx < 0 && this.x < tile.xW +m2 && this.x > tile.xW -m1) {
                            this.x = tile.xW + (m2 + 1)
                        }
                    }
                    if (this.vy != 0 && this.x <= tile.xW +m2 && this.x >= tile.xW -m1) {
                        if (this.vy < 0 && this.y < tile.yW +m2 && this.y > tile.yW -m1) {
                            this.y = tile.yW + (m2 + 1)
                        }
                        if (this.vy > 0 && this.y > tile.yW -m1 && this.y < tile.yW +m1) {
                            this.y = tile.yW - (m1 + 1)
                        }
                    }
                }
            }
        }
    }
}

class Interactable {
    constructor(_x, _y, _width, _height, _b, _type, _infr, _value, _world) {
        this.world   = _world     // WORLDMAP PARENT OBJECT
        this.x       = _x;        // X POSITION IN WORLDMAP
        this.y       = _y;        // Y POSITION IN WORLDMAP
        this.width   = _width;    // WIDTH OF BOX IN PIXELS
        this.height  = _height;   // HEIGHT OF BOX IN PIXELS
        this.xW      = 0;         // GLOBAL X IN CANVAS
        this.yW      = 0;         // GLOBAL Y IN CANVAS
        this.bounds  = _b;        // ARRAY OF BOUNDARY VALUES ([X-POS, Y-POS, WIDTH, HEIGHT])
        this.type    = _type;     // STRING VALUE SPECIFYING WHAT TO DO WHEN THE INTERACTABLE IS USED.
        this.value   = _value;    // DATA THAT DIFFERENT INTERACTABLES USE DIFFERENTLY
        this.inFront = _infr;     // DETERMINES IF THE INTERACTABLE WILL RENDER IN FRONT OF THE PLAYER
        console.log(this.world);
    }
    checkInteractions(_mx, _my) {  // CHECKS IF THE INTERACTABLE SHOULD BE INTERACTED WITH BASED ON _MX (MOUSEX) AND _MY (MOUSEY)
        if (_mx > this.xW && _mx < this.xW + this.width && _my > this.y && _my < this.yW + this.height) {
            this.interact();
        }
    }
    interact() {
        this.loadTheDuckingJSON(this.value);
        //let _json = loadJSON(this.value);
        //console.log(this.world);
        //this.finished(_json);
    }
    _async(_callback){
        let _json = loadJSON(this.value);
        let _world = this.world;
        _callback(_json, _world);    
    }
    loadTheDuckingJSON(){
        // call first function and pass in a callback function which
        // first function runs when it has completed
        this._async(
            function(_json,_world) {
                console.log(_json.image);
                console.log(_world);
                _world.createWorld(_json);
            }
        );    
    }
}

class WorldTileData {
    constructor(_dat) {
        this.bounds = _dat.bounds;
        this.collide = _dat.collide;
    }
}

class WorldTile {  // CLASS CONTAINING TILE DATA.
    constructor(_x, _y, _data) {
        this.x     = _x;                        // X POSITION IN WORLDMAP
        this.y     = _y;                        // Y POSITION IN WORLDMAP
        this.xW    = 0;                         // GLOBAL X IN CANVAS
        this.yW    = 0;                         // GLOBAL Y IN CANVAS
        this.data  = new WorldTileData(_data)   // DATA GAINED FROM JSON FILE ON LOAD

    }
    setCollide() {
        this.data.collide = true;
    }
}

class WorldMap {  // CLASS ORGANIZING WORLDTILE OBJECTS
    constructor(_roomjson, _ns) { 
        //this.img           = loadImage(_roomjson.image)          // THE SPRITESHEET IMAGE TO USE
        //this.xTiles        = _roomjson.xSize;                    // THE NUMBER OF TILES IN WIDTH
        //this.yTiles        = _roomjson.ySize;                    // THE NUMBER OF TILES IN HEIGHT
        this.tileSize      = _ns;                                  // THE TILE SIZE IN PIXELS
        //this.x             = (width/2)-(this.xTiles*_ns/2);      // THE X POSITION OF THE WORLDMAP
        //this.y             = (height/2)-(this.yTiles*_ns/2);     // THE Y POSITION OF THE WORLDMAP
        //this.tiles         = []                                  // ARRAY CONTAINING WORLDTILE OBJECTS
        //this.interactables = []                                  // ARRAY CONTAINING INTERACTABLE OBJECTS
        this.createWorld(_roomjson);
    }
    createWorld(_json) { // CREATES THE TILES AND REWORKS THE DATA FROM A FILE.
        print(_json);
        this.img           = loadImage(_json.image);
        this.xTiles        = _json.xSize;
        this.yTiles        = _json.ySize;
        this.x             = (width/2)-(this.xTiles*this.tileSize/2);
        this.y             = (height/2)-(this.yTiles*this.tileSize/2);
        this.tiles         = []
        this.interactables = []
        let ct = 0;
        for (let i = 0; i < this.xTiles; i++) { // CREATE THE TILE GRID
            for (let j = 0; j < this.yTiles; j++) {

                if (_json.tileData[str("t"+ct)]) {
                    this.tiles[ct] = new WorldTile(i*this.tileSize, j*this.tileSize, _json.tileData[str("t"+ct)]);    // CREATE A TILE WITH DATA FROM ROOMJSON
                } else {
                    this.tiles[ct] = new WorldTile(i*this.tileSize, j*this.tileSize, _json.defaultTile);              // CREATE A TILE WITH DEFAULT DATA FROM ROOMJSON
                }

                if (_json.interactableData[str("t"+ct)]) {
                    let _dat = _json.interactableData[str("t"+ct)]
                    this.interactables[ct] = new Interactable(i*this.tileSize, j*this.tileSize, _dat.width, _dat.height, _dat.bounds, _dat.type, _dat.renderInFront, _dat.value, this); // CREATE A TILE WITH DATA FROM ROOMJSON
                } else {
                    this.interactables[ct] = null; // CREATE A NULL INDEX
                }
                ct++
            }
        }
        for (let i = 0; i < this.tiles.length; i++) { // CREATE COLLIDING WALLS AROUND EDGE
            let tile = null;
            if (i%_json.ySize == 0) {
                tile = _json.wallTileNorth.bounds                               // SET TILE TEXTURE TO NORTH WALL TEXTURE
            } else if (i < _json.ySize) {
                tile = _json.wallTileWest.bounds                                // SET TILE TEXTURE TO WEST WALL TEXTURE
            } else if (this.tiles.length - _json.ySize < i) {
                tile = _json.wallTileEast.bounds                                // SET TILE TEXTURE TO EAST WALL TEXTURE
            } else if (i%_json.ySize == _json.ySize - 1) {
                tile = _json.wallTileSouth.bounds                               // SET TILE TEXTURE TO SOUTH WALL TEXTURE
            }

            if (tile) {
                this.tiles[i].setCollide();
                if (this.tiles[i].data.bounds == _json.defaultTile.bounds) {
                    this.tiles[i].data.bounds = tile;
                }
            }
        }
    }
    checkInteractables() {
        for (let i = 0; i < this.interactables.length; i++) {
            let t = this.interactables[i];
            if (t) {
                t.checkInteractions(mouseX, mouseY);
            }
        }
    }
    draw() { // RENDERS THE WORLD (EACH FRAME)
        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            if (t.data) {
                image(this.img, this.x + t.x, this.y +t.y, this.tileSize, this.tileSize, t.data.bounds[0], t.data.bounds[1], t.data.bounds[2], t.data.bounds[3]);
                t.xW = this.x + t.x;
                t.yW = this.y + t.y;
            } else {
                fill(255,0,0);
                square(this.x, this.y, this.tileSize);
            }
        }
        for (let i = 0; i < this.interactables.length; i++) {
            let t = this.interactables[i];
            if (t) {
                image(this.img, this.x + t.x, this.y +t.y, t.width, t.height, t.bounds[0], t.bounds[1], t.bounds[2], t.bounds[3]);
                t.xW = this.x + t.x;
                t.yW = this.y + t.y;
            }
        }
    }
    drawInFront() {
        for (let i = 0; i < this.interactables.length; i++) {
            let t = this.interactables[i];
            if (t && t.inFront) {
                print("wenis");
                image(this.img, this.x + t.x, this.y +t.y, t.width, t.height, t.bounds[0], t.bounds[1], t.bounds[2], t.bounds[3]);
            }
        }
    }
}