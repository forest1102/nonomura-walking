enchant();

window.onload = function () {
  var game = new Game(320, 320);
  game.fps = 15;
  game.preload(tiled[0].image, 'material/chara0.gif');
  game.onload = function () {
    //map 
    var backMap = Class.create(Map, {
        initialize: function (i) {
          Map.call(this, tiled[i].map.tileheight, tiled[i].map.tilewidth);
          this.image = game.assets[tiled[i].image];
          this.loadData.apply(this, tiled[i].background);
          this.collisionData = tiled[i].collision;
        }
      }),
      foreMap = Class.create(Map, {
        initialize: function (i) {
          Map.call(this, tiled[i].map.tileheight, tiled[i].map.tilewidth);
          this.image = game.assets[tiled[i].image];
          this.loadData.apply(this, tiled[i].foreground);
        }
      }),
      TileMap = Class.create({
        initialize: function (i) {
          this.fore = new foreMap(i);
          this.back = new backMap(i);
        }
      });
    var maps=[new TileMap(0),new TileMap(1)];
    var currentMap = maps[0].back;

    var Player = Class.create(Sprite, {
      initialize: function () {
        Sprite.call(this, 32, 32);
        this.x        = tiled[0].object.playerStartPoint.x - 8;
        this.y        = tiled[0].object.playerStartPoint.y - 16;
        var image     = new Surface(96, 128);
        image.draw(game.assets['material/chara0.gif'], 0, 0, 96, 128, 0, 0, 96, 128);
        this.image    = image;
        this.isMoving = false;
        this.direction= 0;
        this.walk     = 1;
      },
      onenterframe: function () {
        this.frame = this.direction * 3 + this.walk;
        if (this.isMoving) {
          this.moveBy(this.vx, this.vy);

          if (!(game.frame % 3)) {
            this.walk++;
            this.walk %= 3;
          }
          if ((this.vx && (this.x - 8) % 16 === 0) 
          || (this.vy && this.y % 16 === 0)) {
            this.isMoving = false;
            this.walk = 1;
          }
        }
        else {
          this.vx = this.vy = 0;
          if (game.input.left) {
            this.direction = 1;
            this.vx = -4;
          }
          else if (game.input.right) {
            this.direction = 2;
            this.vx = 4;
          }
          else if (game.input.up) {
            this.direction = 3;
            this.vy = -4;
          }
          else if (game.input.down) {
            this.direction = 0;
            this.vy = 4;
          }
          if (this.vx || this.vy) {
            var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
            var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
            if (0 <= x && x < currentMap.width && 0 <= y 
            && y < currentMap.height && !currentMap.hitTest(x, y)) {
              this.isMoving = true;
              arguments.callee.call(this);
            }
          }
        }
      }
      
    });

    var player = new Player();

    maps[0].back.addEventListener('enterframe', function () {
      if (player.isMoving) {
        return;
      }

      if (player.intersect(tiled[0].object.goMap1)) {
        console.log('go map1');
        var stage2 = new Scene();
        stage2.addChild(maps[1].back);
        stage2.addChild(player);
        stage2.addChild(maps[1].fore);
        stage2.addChild(pad);
        currentMap = maps[1].back;
        player.x = tiled[1].object.enterPoint1.x - 8;
        player.y = tiled[1].object.enterPoint1.y - 16;
        game.pushScene(stage2);
        game.current.addChild(stage);
      }
    });
    maps[1].back.addEventListener('enterframe', function () {
      if (player.isMoving) return;
      if (player.intersect(tiled[1].object.goMap0)) {
        var stage2 = new Scene();
        stage2.addChild(maps[0].back);
        stage2.addChild(player);
        stage2.addChild(maps[0].fore);
        stage2.addChild(pad);
        currentMap = maps[0].back;
        player.x = tiled[0].object.playerStartPoint.x - 8;
        player.y = tiled[0].object.playerStartPoint.y - 16;
        game.pushScene(stage2);
        game.current.addChild(stage);
      }
    });
    
    player.addEventListener('enterframe', function mapEvent() {
      if (player.isMoving) {
        return;
      }

      if (player.intersect(tiled[0].object.eventArea1)) {
        console.log(tiled[0].object.eventArea1.message);
      }
    });

    var stage = new Group();
    stage.addChild(maps[0].back);
    stage.addChild(player);
    stage.addChild(maps[0].fore);
    game.rootScene.addChild(stage);


    var pad = new Pad();
    pad.x = 0;
    pad.y = 220;
    game.rootScene.addChild(pad);

    player.addEventListener('enterframe', function (e) {
      var x = Math.min((game.width - 16) / 2 - player.x, 0);
      var y = Math.min((game.height - 16) / 2 - player.y, 0);
      x = Math.max(game.width, x + currentMap.width) - currentMap.width;
      y = Math.max(game.height, y + currentMap.height) - currentMap.height;
      game.currentScene.x = x;
      game.currentScene.y = y;
    });
  };
  game.start();
};