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

class WorldTile {
    constructor(_x, _y, _data) {
        this.x     = _x;            // X POSITION IN WORLDMAP
        this.y     = _y;            // Y POSITION IN WORLDMAP
        this.xW    = 0;             // GLOBAL X IN CANVAS
        this.yW    = 0;             // GLOBAL Y IN CANVAS
        this.data  = _data;         // DATA GAINED FROM JSON FILE ON LOAD
    }
}

class WorldMap {
    constructor(_roomjson, _ns) { 
        this.img       = loadImage(_roomjson.image)          // THE SPRITESHEET TO USE
        this.xTiles    = _roomjson.xSize;                    // THE NUMBER OF TILES IN WIDTH
        this.yTiles    = _roomjson.ySize;                    // THE NUMBER OF TILES IN HEIGHT
        this.tileSize  = _ns;                                // THE TILE SIZE IN PIXELS
        this.x         = (width/2)-(this.xTiles*_ns/2);      // THE X POSITION OF THE WORLDMAP
        this.y         = (height/2)-(this.yTiles*_ns/2);0    // THE Y POSITION OF THE WORLDMAP
        this.tiles     = []                                  // ARRAY CONTAINING WORLDTILE OBJECTS

        let ct = 0;
        for (let i = 0; i < this.xTiles; i++) {
            for (let j = 0; j < this.yTiles; j++) {
                if (_roomjson.tileData[str("t"+ct)]) {
                    print("data found for tile "+ct);
                    this.tiles[ct] = new WorldTile(i*_ns, j*_ns, _roomjson.tileData[str("t"+ct)]);
                } else {
                    this.tiles[ct] = new WorldTile(i*_ns, j*_ns, _roomjson.defaultTile);
                }
                ct++
            }
        }
    }

    draw() {
        fill(100);
        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            if (t.data) {
                image(this.img, this.x + t.x, this.y +t.y, this.tileSize, this.tileSize, t.data.bounds[0], t.data.bounds[1], t.data.bounds[2], t.data.bounds[3]);
                t.xW = this.x + t.x;
                t.yW = this.y + t.y;
            } else {
                fill(255,0,0);
                square(this.x, this.y, this.tileSize)
            }
        }
    }
}