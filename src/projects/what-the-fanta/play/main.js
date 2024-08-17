"use strict";

const Phaser = window.Phaser;

const DEBUG = false;
const DEBUG_VERBOSE = false;
const DEBUG_LOCAL_MODE = true;
const DEBUG_PHYSICS = false;
const DEBUG_LIGHT = 1;
const DEBUG_INVINCIBILITY = false;
const DEBUG_CHUNK = "";
const DEBUG_START_DIFFICULTY = 0;

const GAME_WIDTH = 375;
const GAME_HEIGHT = 667;
const BAT_DISTANCE_FROM_EDGE = 150;
const CHUNK_SPACING = 50;
const ZOMBIE_GRASP_DISTANCE = 316;
const BAT_MOVEMENT_SPEED = 1000;
const BAT_MOVEMENT_DRAG = 0.001;
const BAT_MOVEMENT_MAX_SPEED = 200;
const GAME_SPEED = 200;
const TREE_PARALLAX_SPEED = 230;
const LIGHT_RADIUS_REDUCTION_INTERVAL = 5000;
const LIGHT_RADIUS_REDUCTION = .0008;
const LIGHT_MIN_RADIUS = 0.6;
const LIGHT_MAX_RADIUS = 1.8;
const LIGHT_START_RADIUS = 1.5;
const BOTTLE_LIGHT_RADIUS = .35;
const CLOUD_SCROLL_SPEED = 80;
const POINTS_BOTTLE = 500;
const POINTS_COLLECTABLE = 100;
// number of chunks for each difficulty
const DIFFICULTY_PROGRESSION = [2, 3, 4, 6];
// chunks to spawn for clue chunk, or null if none
const CLUE_CHUNKS = [null, "chunk03", "chunk09", "chunk10"];
// chunk name, difficult (-1 = special clue chunk)
const CHUNKS = [
  ["chunk01", 1],
  ["chunk02", 1],
  ["chunk03", -1],
  ["chunk04", 2],
  ["chunk05", 0],
  ["chunk06", 0],
  ["chunk07", 1],
  ["chunk08", 1],
  ["chunk09", -2],
  ["chunk10", -3],
  ["chunk11", 2],
  ["chunk12", 3],
  ["chunk13", 3],
  ["chunk14", 1],
  ["chunk15", 0],
  ["chunk16", 1],
  ["chunk17", 0],
  ["chunk18", 0],
  ["chunk19", 3],
  ["chunk20", 2],
  ["chunk21", 3],
  ["chunk22", 2],
  ["chunk23", 3],
  ["chunk24", 3],
];

// layering values groups here for easy tweaking
// smaller values render on bottom, higher values on top
const LAYER_HUD = 10000;
const LAYER_CLOUDS = 5000;
const LAYER_TREES = 4000;
const LAYER_EFFECTS = 4000;
const LAYER_BAT = 3000;
const LAYER_OBSTACLE_UPPER = 2001;
const LAYER_LIGHT = 2000;
const LAYER_OBSTACLE_LOWER = 0;
const LAYER_GROUND_DETAILS = -1000;
const LAYER_GROUND = -2000;

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  parent: 'canvas-container',
  roundPixels: true, // fixes blurriness on mobile
  powerPreference: "high-performance",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4
  }
});

game.scene.add('Preload', {
  preload: function () {
    // main game
    this.load.aseprite('reward', 'assets/reward.png', 'assets/reward.json');
    this.load.aseprite('bat', 'assets/bat.png', 'assets/bat.json');
    this.load.aseprite('collision', 'assets/collision.png', 'assets/collision.json');
    this.load.aseprite('zombie', 'assets/zombie.png', 'assets/zombie.json');
    this.load.aseprite('zombie-black', 'assets/zombie-black.png', 'assets/zombie-black.json');
    this.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json');

    // game over
    this.load.image('go-ghost1', 'assets/ghost1.png');
    this.load.image('go-ghost2', 'assets/ghost2.png');
    this.load.image('go-grass', 'assets/grass.png');

    // end of game
    this.load.image('tunnel', 'assets/tunnel.png');
    this.load.image('tunnel-glow', 'assets/tunnel-glow.png');
    this.load.image('endofgame_top', 'assets/endofgame_top.png');
    this.load.image('endofgame_bottom', 'assets/endofgame_bottom.png');

    // clue reveal
    this.load.image('clue1', 'assets/clue-0.png');
    this.load.image('clue2', 'assets/clue-1.png');
    this.load.image('clue3', 'assets/clue-2.png');
    this.load.image('bottle-light', 'assets/bottle-light.png');
    this.load.image('new-clues', 'assets/new-clues.png');
    this.load.image('clue-reveal-bottle', 'assets/clue-reveal-bottle.png');
    this.load.image('clue-reveal-bg', 'assets/clue-reveal-bg.png');

    // chunks    
    for (let i = 0; i < CHUNKS.length; i++) {
      let name = CHUNKS[i][0];
      this.load.json(name, "chunks/" + name + ".json");
    }
  },

  create: function () {
    // animations must be created after images/json are loaded
    this.anims.createFromAseprite('reward');
    this.anims.createFromAseprite('collision');
    let zombie = this.anims.createFromAseprite('zombie');
    zombie[1].repeat = -1;
    let zombieBlack = this.anims.createFromAseprite('zombie-black');
    zombieBlack[1].repeat = -1;
    let batAnim = this.anims.createFromAseprite('bat');
    batAnim[0].repeat = -1;

    let totalChunksToPlay = 0;
    for (let i = 0; i < DIFFICULTY_PROGRESSION.length; i++)
    {
      totalChunksToPlay += DIFFICULTY_PROGRESSION[i];
    }
    this.registry.values.totalChunkCount = totalChunksToPlay;
    this.registry.values.maxDistance = (GAME_HEIGHT + CHUNK_SPACING) * totalChunksToPlay;

    let chunksByDifficulty = [];
    for (let i = 0; i < CHUNKS.length; i++) {
      let name = CHUNKS[i][0];
      let difficulty = CHUNKS[i][1]
      if (chunksByDifficulty[difficulty] == undefined) {
        chunksByDifficulty[difficulty] = []
      }
      chunksByDifficulty[difficulty].push(name);
    }
    this.registry.values.chunksByDifficulty = chunksByDifficulty;

    if (DEBUG) {
      console.log("total_chunks_to_play=" + totalChunksToPlay);
      for (let i = 0; i < this.registry.values.chunksByDifficulty.length; i++) {
        let count = this.registry.values.chunksByDifficulty[i].length;
        console.log("available_" + i + "=" + count);
      }
    }

    console.log("preload complete, waiting for startGame()...");
    isGameReady = true;
    if (DEBUG_LOCAL_MODE || isPageReady) {
      startGame();
    }
  },
}, true);

let isAudioLoaded = false;
game.scene.add('WaitForInput', {
  create: function() {
    console.log("waiting for user input...");

    // even desktop requires a gesture, not a keyboard press
    this.input.on('pointerdown', function () {
      game.scene.stop('WaitForInput');
      if (isAudioLoaded) {
        game.scene.start('Game');
      } else {
        game.scene.start('PreloadAudio');
      }
    });

    if (DEBUG_LOCAL_MODE) {
      game.scene.stop('WaitForInput');
      if (isAudioLoaded) {
        game.scene.start('Game');
      } else {
        game.scene.start('PreloadAudio');
      }
      return;
    }

    // TODO: proper click to play screen?
    let msg = "TAP TO START";
    if (this.sys.game.device.os.desktop) {
      msg = "CLICK TO START";
    }
    let text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg);
    text.x -= text.width / 2;
  }
});

game.scene.add('PreloadAudio', {
  preload: function () {
    // sfx
    this.load.audio("collect1", ["assets/collect1.mp3"]);
    this.load.audio("collect2", ["assets/collect2.mp3"]);
    this.load.audio("impact1", ["assets/impact1.mp3"]);
    this.load.audio("impact2", ["assets/impact2.mp3"]);
    this.load.audio("collect-clue-bottle", ["assets/pickup-clue-bottle.mp3"]);
    this.load.audio("collect-glow-bottle", ["assets/pickup-glow-bottle.mp3"]);
    this.load.audio("win", ["assets/win-stinger.mp3"]);
    this.load.audio("lose", ["assets/lose-stinger.mp3"]);
    this.load.audio("clue-reveal", ["assets/clue-reveal.mp3"]);
    this.load.audio("tunnel", ["assets/tunnel-stinger.mp3"]);
  },

  create: function () {
    isAudioLoaded = true;
    game.scene.stop('PreloadAudio');
    game.scene.start('Game');

    console.log("audio loaded!");
  }
});

game.scene.add('Game', {

  physics: {
    default: 'arcade',
    arcade: {
      debug: DEBUG_PHYSICS,
      debugShowStaticBody: DEBUG_PHYSICS,
      height: 1000,
      fixedStep: false,
      overlapBias: 0,
      checkCollision: {
        up: false,
        down: false,
        left: true,
        right: true,
      },
    }
  },

  create: function () {
    // holds references to objects so we don't need to constantly look them up
    this.ref = {};

    // start a screens width away to compensate for starting emptyiness
    this.data.values.distance = -GAME_HEIGHT;
    this.data.values.totalChunksPlayed = 0
    this.data.values.lives = 3;
    this.data.values.score = 0;
    this.data.values.clues = 0;
    this.data.values.lightRadius = LIGHT_START_RADIUS;
    this.data.values.lightDirty = true;
    this.data.values.isDead = false;
    this.data.values.isGameOver = false;
    this.data.values.fadeOutBackgroundObjects = false;
    this.data.values.touches = [];
    this.data.values.lowFpsMode = false;
    this.data.values.isPaused = false;
    this.data.values.difficulty = DEBUG_START_DIFFICULTY;
    this.data.values.chunkCount = 0;
    this.data.values.lastChunkIndex = -1;

    /**
      There's a bug that adds a 1 pixel border around the light texture since its being scaled.
      As a workaround, the game background is set to black, then a green rect is added that 1 pixel
      smaller on all dimensions to mask the glitchy pixel border.
    **/
    this.add.rectangle(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, "0xBDFCB5")
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND);

    this.ref.chunkMarker = this.physics.add.body(0,0)
      .setVelocity(0, GAME_SPEED);

    this.ref.moveLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.ref.moveRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    
    this.ref.pause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .on("down", () => {
        if (this.data.values.isPaused) {
          this.resumeGame();
        } else {
          this.pauseGame();
        }
      });
    this.ref.pauseAlt = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
      .on("down", () => {
        if (this.data.values.isPaused) {
          this.resumeGame();
        } else {
          this.pauseGame();
        }
      });

    if (DEBUG) {
      this.ref.fps = this.add.text(
        0, GAME_HEIGHT - 16, 
        this.game.loop.actualFps,
        { align: "left", stroke: "#ffffff", color: "#ffffff", fontSize: 20, strokeThickness: 1 }
      ).setDepth(1000000);
      this.ref.delta = this.add.text(
        0, GAME_HEIGHT - 32, 
        "",
        { align: "left", stroke: "#ffffff", color: "#ffffff", fontSize: 20, strokeThickness: 1 }
      ).setDepth(1000000);
      this.ref.bodyCount = this.add.text(
        0, GAME_HEIGHT - 48, 
        "",
        { align: "left", stroke: "#ffffff", color: "#ffffff", fontSize: 20, strokeThickness: 1 }
      ).setDepth(1000000);
      this.ref.touch = this.add.text(
        0, GAME_HEIGHT - 64, 
        "",
        { align: "left", stroke: "#ffffff", color: "#ffffff", fontSize: 20, strokeThickness: 1 }
      ).setDepth(1000000);

      let chunkNameText = this.add.text(
        GAME_WIDTH - 85, 32, 
        "CHUNK01",
        { align: "left", stroke: "#ffffff", color: "#ffffff", fontSize: 12, strokeThickness: 0 }
      ).setDepth(1000000);
      this.ref.chunkName = this.physics.add.existing(chunkNameText)
        .body.setVelocity(0, GAME_SPEED);
    }

    this.setupPlayer();
    this.setupObstacles();
    this.setupEffects();
    this.setupHud();
    this.setupLight();
    this.setupScrollingObjects();
    this.setupPopups();
    this.setupEffects();

    this.addRandomChunk();
    this.setProgress(0);
    this.setClueCount(0);

    this.game.events.addListener(Phaser.Core.Events.BLUR, this.pauseGame, this);
  },

  update: function (time, delta) {
    let deltaSec = delta / 1000;

    if (DEBUG) {
      this.ref.fps.text = Math.round(this.game.loop.actualFps);

      if (DEBUG_VERBOSE) {
        let touches = this.data.values.touches
        let touch = touches[touches.length-1];
        if (touch == null) {
          this.ref.touch.text = "count=0";
        } else {
          this.ref.touch.text = "count=" + touches.length + " id=" + touch.id + " x=" + touch.x;
        }
        this.ref.delta.text = Math.round((delta + Number.EPSILON) * 100) / 100;
        let bodyCount = this.physics.world.bodies.entries.length;
        let effectCount = this.ref.activeEffects.length;
        let popupCount = this.ref.activePopups.length;
        let obstacleCount = this.ref.obstacleGroup.countActive();
        let obstacleUpperCount = this.ref.obstacleUpperGroup.countActive();
        this.ref.bodyCount.text = "B:" + bodyCount + " O: " + obstacleCount 
          + " U: " + obstacleUpperCount + " E:" + effectCount + " P:" + popupCount;
      }

      if (this.ref.chunkName.y > GAME_HEIGHT) {
        this.ref.chunkName.y = 0;
      }
    }

    if (this.data.values.isPaused) {
      return;
    }

    this.updateBat();
    this.updateObstacles();
    this.updateLight();
    this.checkLowFps();
    this.updateTempObjects(deltaSec, this.ref.activeEffects, this.ref.effectGroup);
    this.updateTempObjects(deltaSec, this.ref.activePopups, this.ref.popupGroup);

    for (let i = 0; i < this.ref.scrollingObjects.length; i++) {
      let obj = this.ref.scrollingObjects[i];
      obj[0].y += deltaSec * obj[1];

      if (this.data.values.fadeOutBackgroundObjects) {
        obj[0].alpha -= deltaSec * 2;
      }

      if (obj[0].y >= GAME_HEIGHT) {
        obj[0].y = -obj[0].height; 
        if (obj[2]) {
          obj[0].x = Phaser.Math.RND.integerInRange(0, GAME_WIDTH);
        }
      }
    }    

    this.data.values.distance += GAME_SPEED * deltaSec;
    let progress = this.data.values.distance / this.registry.values.maxDistance;
    this.setProgress(progress);

    if (this.ref.chunkMarker.y > GAME_HEIGHT 
      && this.data.values.totalChunksPlayed < this.registry.values.totalChunkCount) {
      this.ref.chunkMarker.y = -CHUNK_SPACING;
      this.addRandomChunk();
    }

    if (this.data.values.distance >= this.registry.values.maxDistance) {
      this.data.values.fadeOutBackgroundObjects = true;
    }

    if (this.data.values.distance > this.registry.values.maxDistance + (GAME_HEIGHT / 4)) {
      let finalScore = this.data.values.score;
      this.saveScore(finalScore);

      let clues = this.data.values.clues;
      let batX = this.ref.player.body.x;
      let batFrame = this.ref.player.frame;
      this.game.scene.stop('Game');
      this.game.scene.start('EndOfGame', { 
        score: finalScore, 
        lightRadius: this.data.values.lightRadius,
        batX: batX,
        batFrame: batFrame,
        clues: clues,
      });
    } else if (this.data.values.isGameOver) {
      let finalScore = this.data.values.score;
      this.saveScore(finalScore);

      let clues = this.data.values.clues;
      this.game.scene.stop('Game');
      this.game.scene.start('GameOver', {
        score: finalScore,
        clues: clues,
      });
    }
  },

  extend: {
    saveScore(newScore) {
      var highScoreStr = localStorage.getItem("highscore");
      if (highScoreStr === null)
      {
        // score didn't exist
        localStorage.setItem("highscore", newScore);
      }
      else if (newScore > Number.parseInt(highScoreStr))
      {
        // player got better score
        localStorage.setItem("highscore", newScore);
      }
      localStorage.setItem("score", newScore);
    },

    pageTouchStart(event) {
      let touch = event.changedTouches[0];
      this.scene.scene.data.values.touches.push({ id: touch.identifier, x: touch.clientX });
    },

    pageTouchEnd(event) {
      let touch = event.changedTouches[0];
      let touches = this.scene.scene.data.values.touches;
      for (let i = 0; i < touches.length; i++) {
        if (touches[i].id == touch.identifier) {
          touches.splice(i, 1);
        }
      }
    },

    pageTouchMove(event) {
      let touch = event.changedTouches[0];
      let touches = this.scene.scene.data.values.touches;
      for (let i = 0; i < touches.length; i++) {
        if (touches[i].id == touch.identifier) {
          touches[i].x = touch.clientX;
          break;
        }
      }
    },
    
    pauseGame: function () {
      if (!this.game.scene.isActive("Game")) {
        return;
      }
      if (this.data.values.isPaused) {
        return;
      }
      this.data.values.isPaused = true;
      this.physics.pause();
      this.ref.pauseLayer.setVisible(true);
      this.ref.hudLayer.setVisible(false);

      let score = this.data.values.score;
      this.ref.pauseScoreText.text = score.toString().padStart(6, "0");

      let highScore = localStorage.getItem("highscore");
      if (highScore == null) {
        // no high score, so show current score instead
        highScore = score;
      } else {
        highScore = parseInt(highScore);
      }

      if (score > highScore) {
        // player beat high score, so show current score instead
        highScore = score;
      }
      this.ref.highScoreText.text = highScore.toString().padStart(6, "0");
    },

    resumeGame: function () {
      if (!this.data.values.isPaused) {
        return;
      }
      this.data.values.isPaused = false;
      this.physics.resume();
      this.ref.pauseLayer.setVisible(false);
      this.ref.hudLayer.setVisible(true);
    },

    updateTempObjects: function (delta, list, group) {
      for (let i = list.length - 1; i >= 0; i--) {
        let e = list[i];
        e.y += GAME_SPEED * delta;
        if (e.anims != null && e.anims.isPlaying) {
          // still playing anim
          continue;
        }
        if (e.y < GAME_HEIGHT) {
          // still onscreen
          continue;
        }
        if (e.data == null || e.data.values.group == null) {
          group.killAndHide(e);
        } else {
          e.data.values.group.killAndHide(e);
        }
        list.splice(i, 1);
      }
    },

    setupPopups: function() {
      let scene = this;
      this.ref.activePopups = [];
      this.ref.popupGroup = [];
      this.ref.popupGroup[0] = this.add.group({
        visible: false,
        active: false,
        classType: Phaser.GameObjects.Text,
        createCallback: function (go) {
          go.setText("+" + POINTS_COLLECTABLE)
            .setStyle({
              align: "center", stroke: "#000000", color: "#ffffff",
              fontSize: 30, strokeThickness: 4, fontFamily: "FantaPop" 
            })
            .setDepth(LAYER_EFFECTS)
            .setOrigin(0.5, 0.5);
          go.setData("group", scene.ref.popupGroup[0]);
        }
      });

      this.ref.popupGroup[1] = this.add.group({
        visible: false,
        active: false,
        classType: Phaser.GameObjects.Text,
        createCallback: function (go) {
          go.setText("+" + POINTS_BOTTLE)
            .setStyle({
              align: "center", stroke: "#000000", color: "#ffffff",
              fontSize: 30, strokeThickness: 4, fontFamily: "FantaPop" 
            })
            .setDepth(LAYER_EFFECTS)
            .setOrigin(0.5, 0.5);
          go.setData("group", scene.ref.popupGroup[1]);
        }
      });

      this.ref.popupGroup[2] = this.add.group({
        visible: false,
        active: false,
        classType: Phaser.GameObjects.Text,
        createCallback: function (go) {
          go.setText("+CLUE")
            .setStyle({
              align: "center", stroke: "#000000", color: "#ffffff",
              fontSize: 30, strokeThickness: 4, fontFamily: "FantaPop" 
            })
            .setDepth(LAYER_EFFECTS)
            .setOrigin(0.5, 0.5);
          go.setData("group", scene.ref.popupGroup[2]);
        }
      });

      // prewarm since creating text is expensive
      for (let i = 0; i < 10; i++) {
        let go = this.ref.popupGroup[0].create();
        this.ref.popupGroup[0].killAndHide(go);
      }
      for (let i = 0; i < 2; i++) {
        let go = this.ref.popupGroup[1].create();
        this.ref.popupGroup[1].killAndHide(go);
      }
      for (let i = 0; i < 1; i++) {
        let go = this.ref.popupGroup[2].create();
        this.ref.popupGroup[2].killAndHide(go);
      }
    },

    addPopup: function(x, y, type) {
      let group = this.ref.popupGroup[type];
      let popup = group.get(x, y)
        .setActive(true)
        .setVisible(true);
      this.ref.activePopups.push(popup);
      return popup;
    },

    setupEffects: function () {
      this.ref.activeEffects = [];
      this.ref.effectGroup = this.add.group({
        visible: false,
        active: false,
      });
    },

    createEffect: function(x, y) {
      let effect = this.ref.effectGroup.get(x, y)
        .setOrigin(0.5, 0.5)
        .setDepth(LAYER_EFFECTS)
        .setActive(true)
        .setVisible(true);
      return effect;
    },

    playCollisionAnim: function (x, y) {
      let effect = this.createEffect(x, y);
      effect.setTexture("collision");
      let deg = Phaser.Math.RND.integerInRange(0, 359);
      effect.setRotation(Phaser.Math.DEG_TO_RAD * deg)
      effect.play("collision");
      this.ref.activeEffects.push(effect);
    },

    playRewardAnim: function(x, y) {
      let effect = this.createEffect(x, y);
      effect.setTexture("reward");
      let deg = Phaser.Math.RND.integerInRange(0, 359);
      effect.setRotation(Phaser.Math.DEG_TO_RAD * deg)
      effect.play("reward");
      this.ref.activeEffects.push(effect);
    },

    setupPlayer: function () {
      let bat = this.add.sprite(0, 0, 'bat')
        .play("bat")
        .setOrigin(0, 0);

      let container = this.add.container(GAME_WIDTH / 2 - (bat.width / 2), GAME_HEIGHT - BAT_DISTANCE_FROM_EDGE, [
        bat,
      ]).setDepth(LAYER_BAT);

      let gameObject = this.physics.add.existing(container);
      gameObject.body
        .setSize(50, 20)
        .setOffset(12, 10)
        .setAllowDrag(true)
        .setDrag(BAT_MOVEMENT_DRAG)
        .setCollideWorldBounds(true)
        .setMaxSpeed(BAT_MOVEMENT_MAX_SPEED);
      gameObject.body.useDamping = true;

      this.ref.player = gameObject;
    },

    setupScrollingObjects: function () {
      let scrollingObjects = [];
      let clouds = [];
      let trees = [];

      // ground elements
      let groundConfig = [
        "grass", "stone", "stones", 
        "stones", "grass", "stone", 
        "stone", "stones", "grass",
      ];
      for (let i = 0; i < groundConfig.length; i++) {
        let spacing = 60;
        let x = Phaser.Math.RND.integerInRange(0, GAME_WIDTH);
        let y = (i * spacing) + Phaser.Math.RND.integerInRange(0, spacing);
        let e = this.add.image(x, y, "atlas", groundConfig[i])
          .setDepth(LAYER_GROUND_DETAILS)
          .setAlpha(1.0);
        scrollingObjects.push([e, GAME_SPEED, true]);
      }

      // clouds
      let cloudConfig = [
        // base layers
        ["clouds1", 70, 0.05, -300],
        ["clouds2", 70, 0.05, 0],
        ["clouds3", 70, 0.05, 300],
        ["clouds2", 70, 0.05, 600],
        // parallax
        ["clouds3", 150, 0.05, 0],
        ["clouds4", 120, 0.05, -200],
      ]
      for (let i = 0; i < cloudConfig.length; i++) {
        let speed = cloudConfig[i][1];
        let alpha = cloudConfig[i][2];
        let tex = cloudConfig[i][0];
        let pos = cloudConfig[i][3];
        let cloud = this.add.image(0, pos, "atlas", tex)
          .setOrigin(0, 0)
          .setDepth(LAYER_CLOUDS)
          .setAlpha(alpha);
        clouds.push(cloud);
        scrollingObjects.push([cloud, speed, false]);
      }
      
      // right trees
      for (let i = 0; i < 2; i++) {
        let tree = this.add.image(0, GAME_HEIGHT * i, "atlas", "trees")
          .setAlpha(1)
          .setDepth(LAYER_TREES)
          .setOrigin(0, 0);
        tree.x = GAME_WIDTH - tree.width;
        scrollingObjects.push([tree, TREE_PARALLAX_SPEED, false]);
        trees.push(tree);
      }

      // left trees
      for (let i = 0; i < 2; i++) {
        let tree = this.add.image(0, GAME_HEIGHT * i, "atlas", "trees")
          .setAlpha(1)
          .setDepth(LAYER_TREES)
          .setRotation(Phaser.Math.DEG_TO_RAD * 180)
          .setOrigin(1, 1);
        tree.x = 0;
        scrollingObjects.push([tree, TREE_PARALLAX_SPEED]);
        trees.push(tree);
      }

      this.ref.trees = trees;
      this.ref.clouds = clouds;
      this.ref.scrollingObjects = scrollingObjects;
    },

    checkLowFps: function() {
      if (this.data.values.lowFpsMode) {
        return;
      }

      if (this.game.loop.actualFps >= 50) {
        return;
      }

      console.log("Low FPS detected, reducing quality");
      this.enableLowFpsMode();
      this.data.values.lowFpsMode = true;
    },

    enableLowFpsMode: function() {
      for (let i = 0; i < this.ref.clouds.length; i++) {
        let cloud = this.ref.clouds[i];
        cloud.setVisible(false);
      }

      for (let i = 0; i < this.ref.trees.length; i++) {
        let tree = this.ref.trees[i];
        tree.setVisible(false);
      }
    },

    addRandomChunk: function() {
      let pos = -GAME_HEIGHT;

      if (DEBUG_CHUNK.length > 0) {
        this.addChunk(DEBUG_CHUNK, pos);
        return;
      }

      // if last chunk of difficulty, spawn clue chunk
      let difficulty = this.data.values.difficulty;
      if (this.data.values.chunkCount == DIFFICULTY_PROGRESSION[difficulty] - 1
        && CLUE_CHUNKS[difficulty] != null) {
        let clueChunk = CLUE_CHUNKS[difficulty];
        this.addChunk(clueChunk, pos);
        return;
      }

      let possibleChunks = this.registry.values.chunksByDifficulty[difficulty];
      let index = Phaser.Math.RND.integerInRange(0, possibleChunks.length - 1);

      let lastIndex = this.data.values.lastChunkIndex;
      if (lastIndex != -1 && lastIndex == index) {
        // dupe, do it again
        this.addRandomChunk();
        return;
      }
      this.data.values.lastChunkIndex = index;

      let chunk = possibleChunks[index];
      this.addChunk(chunk, pos);
    },

    // alex larioza, games right meow, 2023

    addUpperObstacle: function (target, tex) {
      let e = this.ref.obstacleUpperGroup.get(target.x, target.y)
        .setTexture("atlas", tex)
        .setFlipX(target.flipX)
        .setDepth(LAYER_OBSTACLE_UPPER)
        .setActive(true)
        .setVisible(true);
      e.depth += GAME_HEIGHT + e.y;
      this.ref.upperObstacles.push([target, e]);
    },

    addChunk: function(chunkName, pos) {
      let data = this.cache.json.get(chunkName)

      let difficulty = this.data.values.difficulty;
      if (DEBUG) {
        this.ref.chunkName.gameObject.text = chunkName + " (" + difficulty + ")";
      }

      this.data.values.chunkCount++;
      this.data.values.totalChunksPlayed++;
      if (this.data.values.chunkCount == DIFFICULTY_PROGRESSION[difficulty]) {
        this.data.values.difficulty = Math.min(difficulty + 1, DIFFICULTY_PROGRESSION.length - 1);
        this.data.values.chunkCount = 0;
        this.data.values.lastChunkIndex = -1;
      }

      let entities = data.layers[0].entities;
      for (let i = 0; i < entities.length; i++) {
        let e = entities[i];

        let obstacle = this.ref.obstacleGroup.get(e.x, e.y + pos)
          .setVelocity(0, GAME_SPEED)
          .setDepth(LAYER_OBSTACLE_LOWER)
          .setActive(true)
          .setFlipX((e.flippedX != null) ? e.flippedX : false)
          .setVisible(true);
        obstacle.setData("children", []);
        obstacle.body.setEnable(true);
        obstacle.body.collideWorldBounds = false;
        obstacle.body.customSeparateX = false;
        obstacle.body.customSeparateY = false;
        obstacle.stop();
        obstacle.anims.currentAnim = null;
        obstacle.depth += obstacle.y;
        
        switch (e.name) {
          case "zombie":
            {
              obstacle.setTexture("zombie")
                .setDepth(LAYER_OBSTACLE_UPPER + GAME_HEIGHT) // zombie always on top
                .setName("zombie")
                .setVisible(false)
                .setSize(60, 20);
            }
            break;
          case "gravestone_large":
            {
              obstacle.setTexture("atlas", "gravestone-large-lower")
                .setName("gravestone-large")
                .setSize(45, 70);
              this.addUpperObstacle(obstacle, "gravestone-large");
            }
            break;
          case "gravestone_small":
            {
              obstacle.setTexture("atlas", "gravestone-small-lower")
                .setName("gravestone-small")
                .setSize(30, 50);
              this.addUpperObstacle(obstacle, "gravestone-small");
            }
            break;
          case "collectable":
            {
              obstacle.setTexture("atlas", "collectable")
                .setName("collectable")
                .setCircle(15, 7, 10);
              this.addUpperObstacle(obstacle, "collectable");
            }
            break;
          case "pumpkin":
            {
              obstacle.setTexture("atlas", "pumpkin-lower")
                .setName("pumpkin")
                .setCircle(28, 2, 10);
              this.addUpperObstacle(obstacle, "pumpkin");
            }
            break;
          case "glow_bottle":
            {
              obstacle.setTexture("atlas", "fanta-light-lower")
                .setName("fanta-light")
                .setSize(28, 40)
                .setOffset(4, 8);
              this.addUpperObstacle(obstacle, "fanta-light");
            }
            break;
          case "clue_bottle":
            {
              obstacle.setTexture("atlas", "fanta-clue-lower")
                .setName("fanta-clue")
                .setCircle(16, -5, 5);
                this.addUpperObstacle(obstacle, "fanta-clue");
              let child = this.ref.obstacleGroup.get(e.x, e.y + pos)
                .setTexture(null)
                .setName("fanta-clue")
                .setVisible(false)
                .setData("children", [])
                .setActive(true)
                .setVelocity(0, GAME_SPEED)
                .setCircle(16, 0, 20);
              child.body.setEnable(true);
              child.data.values.children.push(obstacle);
              obstacle.data.values.children.push(child);
            }
        }
      }
    },

    setupLight: function() {
      let container = createLightContainer(this);
      container.x = GAME_WIDTH / 2;
      container.y = this.ref.player.body.y + 20;
      this.ref.lightContainer = container;

      this.updateLight();
    },

    setProgress: function(progress) {
      let p = Math.min(Math.max(progress, 0), 1);
      let max = this.data.values.progressMax;
      let y = (max * (1.0-p));
      // the mask is moved instead of the progress bar because
      // the bar isnt square and bitmap masks are expensive
      this.ref.progressBarMask.y = y;
      this.ref.progressBat.y = y + 16;
    },

    setClueCount: function(count) {
      for (let i = 0; i < 3; i++) {
        let visible = i + 1 <= count;
        this.ref.cluesFilled[i].setVisible(visible);
        this.ref.cluesOutline[i].setVisible(!visible);
        this.ref.clueText.text = count;
      }
    },

    setupHud: function() {
      let hearts = [];
      this.ref.hearts = hearts;

      let cluesFilled = [];
      this.ref.cluesFilled = cluesFilled;

      let cluesOutline = [];
      this.ref.cluesOutline = cluesOutline;

      let scoreText = this.add.text(
        68, 58, "000000", 
        { fontSize: 18, strokeThickness: 0, fontFamily: "FantaPop" }
      );
      this.ref.scoreText = scoreText;

      let clueText = this.add.text(
        106, 20, "0", 
        { fontSize: 18, strokeThickness: 0, fontFamily: "FantaPop" }
      );
      this.ref.clueText = clueText;

      let progressBar = this.add.image(GAME_WIDTH - 48, 16, 'atlas', 'progress-bar-fg')
        .setScale(1, 1)
        .setOrigin(0, 0);
      let shape = this.make.graphics()
        .fillStyle(0xffffff, 1)
        .fillRect(GAME_WIDTH - 48, 16, progressBar.width, progressBar.height);
      shape.y += progressBar.height;
      var mask = progressBar.createGeometryMask(shape);
      progressBar.setMask(mask);
      this.ref.progressBarMask = shape;
      this.data.values.progressMax = progressBar.height;

      let progressBat = this.add.image(GAME_WIDTH - 48, 0, 'atlas', 'progress-bat').setOrigin(0, 0);
      let batShape = this.make.graphics()
        .fillStyle(0xffffff, 1)
        .fillRect(GAME_WIDTH - 48, 16, progressBar.width, progressBar.height);
      var batMask = progressBar.createGeometryMask(batShape);
      progressBat.setMask(batMask);
      this.ref.progressBat = progressBat;

      let pauseButton = this.add.image(GAME_WIDTH - 55, 150, 'atlas', 'pause')
        .setOrigin(0, 0)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', function(pointer, localX, localY, event) {
          this.scene.pauseGame();
        });

      let hudLayer = this.add.layer();
      hudLayer.add([ 
        this.add.image(GAME_WIDTH - 48, 16, 'atlas', 'progress-bar-bg').setOrigin(0, 0),
        progressBar,
        progressBat,
        pauseButton,
        this.add.image(32, 16, 'atlas', 'hud-bar').setOrigin(0, 0),
        this.add.image(32, 53, 'atlas', 'hud-bar').setOrigin(0, 0),
        this.add.image(32, 89, 'atlas', 'hud-bar').setOrigin(0, 0),
        this.add.image(45, 58, 'atlas', 'score-icon').setOrigin(0, 0),
        clueText,
        this.add.text(
          98, 22, "x", 
          { fontSize: 14, strokeThickness: 0, fontFamily: "FantaPop" }
        ),
        scoreText,
        hearts[0] = this.add.image(45, 94, 'atlas', 'heart').setOrigin(0, 0),
        hearts[1] = this.add.image(72, 94, 'atlas', 'heart').setOrigin(0, 0),
        hearts[2] = this.add.image(99, 94, 'atlas', 'heart').setOrigin(0, 0),
        cluesFilled[0] = this.add.image(50, 21, 'atlas', 'icon-clue-filled').setOrigin(0, 0),
        cluesFilled[1] = this.add.image(65, 21, 'atlas', 'icon-clue-filled').setOrigin(0, 0),
        cluesFilled[2] = this.add.image(80, 21, 'atlas', 'icon-clue-filled').setOrigin(0, 0),
        cluesOutline[0] = this.add.image(50, 21, 'atlas', 'icon-clue-outline').setOrigin(0, 0),
        cluesOutline[1] = this.add.image(65, 21, 'atlas', 'icon-clue-outline').setOrigin(0, 0),
        cluesOutline[2] = this.add.image(80, 21, 'atlas', 'icon-clue-outline').setOrigin(0, 0),
      ]);
      hudLayer.setDepth(LAYER_HUD);
      this.ref.hudLayer = hudLayer;

      let resumeButton = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'atlas', 'resume')
        .setOrigin(0.5, 0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', function(pointer, localX, localY, event) {
          this.scene.resumeGame();
        });
      
      let pauseLayer = this.add.layer();
      pauseLayer.add([ 
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, "0x000000").setOrigin(0, 0).setAlpha(0.8),
        this.add.image(0, GAME_HEIGHT, "go-grass").setOrigin(0, 1),
        resumeButton,
        this.add.text(
          GAME_WIDTH / 2 - 85, GAME_HEIGHT / 2 - 50, "your score", 
          { fontSize: 20, fontFamily: "FantaPop", color: "#ffffff" }
        ).setOrigin(0.5, 0),
        this.ref.pauseScoreText = this.add.text(
          GAME_WIDTH / 2 - 85, GAME_HEIGHT / 2 - 25, "000000", 
          { fontSize: 45, fontFamily: "FantaPop", color: "#ffffff" }
        ).setOrigin(0.5, 0),
        this.add.text(
          GAME_WIDTH / 2 + 85, GAME_HEIGHT / 2 - 50, "BEST SCORE",
          { fontSize: 20, strokeThickness: 0, fontFamily: "FantaPop" }
        ).setOrigin(0.5, 0),
        this.ref.highScoreText = this.add.text(
          GAME_WIDTH / 2 + 85, GAME_HEIGHT / 2 - 25, "x",
          { fontSize: 45, strokeThickness: 0, fontFamily: "FantaPop" }
        ).setOrigin(0.5, 0),
      ])
      pauseLayer.setDepth(LAYER_HUD + 10).setVisible(false);
      this.ref.pauseLayer = pauseLayer;
    },
    
    animateLightRadius: function (amount) {
      let radius = this.data.values.lightRadius;
      let value = null;
      if (radius + amount > LIGHT_MAX_RADIUS) {
        value = LIGHT_MAX_RADIUS;
      } else {
        value = "+" + amount;
      }

      this.tweens.add({
        targets: this.data.values,
        lightRadius: value,
        ease: 'Quad',
        duration: 500,
        repeat: 0,
        yoyo: false,
      });
    },

    setLightRadius: function(amount) {
      let radius = this.data.values.lightRadius;
      this.data.values.lightRadius = Math.min(Math.max(radius + amount, LIGHT_MIN_RADIUS), LIGHT_MAX_RADIUS);
      this.data.values.lightDirty = true;
    },

    updateLight: function() {
      this.setLightRadius(-LIGHT_RADIUS_REDUCTION);

      let bat = this.ref.player;
      this.ref.lightContainer.x = bat.body.x + 30;

      if (this.data.values.lightDirty) {
        this.ref.lightContainer.setScale(this.data.values.lightRadius);
        this.data.values.lightDirty = false;
      }
    },

    removeLife: function() {
      if (DEBUG_INVINCIBILITY) {
        return;
      }

      let livesRemaining = this.data.values.lives;
      if (livesRemaining == 0) {
        return;
      }
      
      livesRemaining--;
      this.data.values.lives = livesRemaining;
    
      if (livesRemaining == 0) {
        this.data.values.isDead = true;
        this.ref.player.body
          .setVelocity(0, GAME_SPEED)
          .setAccelerationX(0);
        let scene = this;
        this.tweens.add({
          targets: this.ref.player,
          alpha: 0,
          ease: 'Expo.easeOut',
          duration: 500,
          repeat: 0,
          yoyo: false,
          onComplete: function () {
            // switching scenes off the main update causes problems
            scene.data.values.isGameOver = true;
          }
        });
        return;
      }
    
      let hearts = this.ref.hearts;
      for (let i = 0; i < hearts.length; i++) {
        if (i < livesRemaining) {
          hearts[i].setAlpha(1.0);
        } else {
          hearts[i].setAlpha(0.2);
        }
      }
    },

    addPoints: function(points) {
      let score = this.data.values.score;
      score += points;
      this.data.values.score = score;
      let str = score.toString().padStart(6, "0");
      this.ref.scoreText.text = str;
    },
    
    updateBat: function() {
      if (this.data.values.isDead) {
        return;
      }

      let bat = this.ref.player;
      if (this.canMoveLeft()) {
        if (bat.body.velocity.x > 0) {
          bat.body.velocity.x = 0;
        }
        bat.body.setAccelerationX(-BAT_MOVEMENT_SPEED)
      } else if (this.canMoveRight()) {
        if (bat.body.velocity.x < 0) {
          bat.body.velocity.x = 0;
        }
        bat.body.setAccelerationX(BAT_MOVEMENT_SPEED)
      } else {
        bat.body.setAccelerationX(0)
      }
    },

    canMoveLeft: function() {
      if (this.sys.game.device.os.desktop) {
        let moveLeft = this.ref.moveLeft;
        return moveLeft.isDown;
      } else {
        if (this.data.values.touches.length == 0) {
          return false;
        }
        let touches = this.data.values.touches;
        let touch = touches[touches.length-1];
        return touch.x < GAME_WIDTH / 2;
      }
    },
    
    canMoveRight: function() {
      if (this.sys.game.device.os.desktop) {
        let moveRight = this.ref.moveRight;
        return moveRight.isDown;
      } else {
        if (this.data.values.touches.length == 0) {
          return false;
        }
        let touches = this.data.values.touches;
        let touch = touches[touches.length-1];
        return touch.x >= GAME_WIDTH / 2;
      }
    },
    
    setupObstacles: function () {
      this.ref.obstacleGroup = this.physics.add.group({
        visible: false,
        active: false,
      });

      this.ref.obstacleUpperGroup = this.add.group({
        visible: false,
        active: false,
      });

      // prewarm groups
      for (let i = 0; i < 20; i++) {
        let e1 = this.ref.obstacleGroup.create(0, 0, null, null, false, false);
        this.ref.obstacleGroup.killAndHide(e1);
        let e2 = this.ref.obstacleUpperGroup.create(0, 0, null, null, false, false);
        this.ref.obstacleUpperGroup.killAndHide(e2);
      }

      this.ref.upperObstacles = [];
    },

    updateObstacles: function() {
      let bat = this.ref.player;

      // update main lower layer objects
      let obstacleGroup = this.ref.obstacleGroup;
      for (let i = 0; i < obstacleGroup.children.size; i++) {
        let go = obstacleGroup.children.entries[i];
        if (!go.active) {
          continue;
        }

        if (go.name == "zombie") {
          if (go.y >= ZOMBIE_GRASP_DISTANCE) {
            if (go.anims.currentAnim == null) {
              go.setVisible(true);
              go.chain(["reach", "grab"]);
              go.stop(); // .chain() requires this to play it
            }
          }
        }

        if (!this.data.values.isDead && go.y > bat.y - 50 && this.physics.overlap(bat, go)) {
          go.body.enable = false;
          obstacleGroup.killAndHide(go);
          switch (go.name)
          {
            case "gravestone-large":
            case "gravestone-small":
            case "zombie":
            case "pumpkin":
              {
                let rate = Phaser.Math.RND.realInRange(0.8, 1.2);
                if (Math.random() > 0.5) {
                  this.sound.play("impact1", { rate: rate });
                } else {
                  this.sound.play("impact2", { rate: rate });
                }
                this.removeLife();
                this.playCollisionAnim(go.x, go.y);
                break;
              }

            case "collectable":
              {
                let rate = Phaser.Math.RND.realInRange(0.8, 1.2);
                if (Math.random() > 0.5) {
                  this.sound.play("collect1", { rate: rate });
                } else {
                  this.sound.play("collect2", { rate: rate });
                }
                this.addPoints(POINTS_COLLECTABLE);
                this.playRewardAnim(go.x, go.y);
                this.addPopup(go.x, go.y - 8, 0);
                break;
              }

            case "fanta-light":
              this.sound.play("collect-glow-bottle", { rate: 0.8 });
              this.animateLightRadius(BOTTLE_LIGHT_RADIUS);
              this.addPoints(POINTS_BOTTLE);
              this.playRewardAnim(go.x, go.y);
              this.addPopup(go.x, go.y - 8, 1);
              break;
            case "fanta-clue":
              this.sound.play("collect-clue-bottle");
              this.data.values.clues++;
              this.setClueCount(this.data.values.clues);
              this.playRewardAnim(go.x, go.y);
              this.addPopup(go.x, go.y - 8, 2);
              break;
          }

          for (let i = 0; i < go.data.values.children.length; i++) {
            let child = go.data.values.children[i];
            child.body.enable = false;
            obstacleGroup.killAndHide(child);
          }
        } else if (go.body.y > GAME_HEIGHT) {
          obstacleGroup.killAndHide(go);
        }
      }

      // update upper layer visuals
      let obstacleUpperGroup = this.ref.obstacleUpperGroup;
      for (let i = this.ref.upperObstacles.length - 1; i >= 0; i--) {
        let pair = this.ref.upperObstacles[i]
        let target = pair[0];
        let upper = pair[1];
        if (!target.visible) {
          // main lower level visual was removed, so remove this too
          this.ref.upperObstacles.splice(i, 1);
          obstacleUpperGroup.killAndHide(upper);
          continue;
        }

        upper.x = target.x;
        upper.y = target.y + 4;
      }
    }
  }
});

game.scene.add('EndOfGame', {
  create: function (data) {
    let containerObjects = [];
    let ground = this.add.rectangle(0, 300, GAME_WIDTH, GAME_HEIGHT, "0xBEFDB7")
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND);

    let bottom = this.add.image(0, 0, "endofgame_bottom")
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND + 1);

    let top = this.add.image(0, 0, "endofgame_top")
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND + 1);

    let bat = this.add.sprite(0, 0,'bat')
      .play("bat")
      .setFrame(data.batFrame)
      .setOrigin(0.5, 0.5);
    bat.setPosition(data.batX + (bat.width / 2) , GAME_HEIGHT - BAT_DISTANCE_FROM_EDGE + (bat.height / 2));

    let glow = this.add.image(0, -25, "tunnel-glow")
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND + 1);

    let zombie1 = this.add.sprite(GAME_WIDTH / 2 + 85, GAME_HEIGHT / 2 - 65, "zombie-black")
      .setScale(0.7)
      .setRotation(Phaser.Math.DEG_TO_RAD * 90)
      .setOrigin(0, 0)
      .setDepth(LAYER_GROUND + 1)
      .play("grab-black");

    let zombie2 = this.add.sprite(GAME_WIDTH / 2 - 50, GAME_HEIGHT / 2 - 30, "zombie-black")
      .setScale(0.7)
      .setRotation(Phaser.Math.DEG_TO_RAD * -90)
      .setOrigin(0, 0)
      .setFlipX(true)
      .setDepth(LAYER_GROUND + 1)
      .play("grab-black");

    containerObjects.push(ground);
    containerObjects.push(bottom);
    containerObjects.push(glow);
    let tunnels = [];
    for (let i = 0; i < 9; i++) {
      let tunnel = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 125, "tunnel")
        .setDepth(LAYER_GROUND + 1).setAlpha(1).setScale(0)
        .setRotation((i * 50) * Phaser.Math.DEG_TO_RAD);
      tunnels.push(tunnel);
      containerObjects.push(tunnel);
    }
    
    containerObjects.push(zombie1);
    containerObjects.push(zombie2);
    containerObjects.push(top);

    let light = createLightContainer(this);
    light.scale = data.lightRadius;
    light.x = bat.x;
    light.y = bat.y + 20;

    this.tweens.add({
      targets: [bat, light],
      x: GAME_WIDTH / 2,
      ease: 'Expo',
      duration: 2000,
      repeat: 0,
      yoyo: false,
    });

    this.tweens.add({
      targets: light,
      scale: 3,
      ease: 'Quad',
      duration: 3000,
      repeat: 0,
      yoyo: false,
    });

    let container = this.add.container(0, -667, containerObjects).setDepth(LAYER_GROUND);

    let tunnelTweens = [];
    for (let i = 0; i < tunnels.length; i++) {
      let tween = this.tweens.add({
        targets: tunnels[i],
        delay: i * 700,
        scale: 2,
        rotation: { from: 0, to: -Phaser.Math.DEG_TO_RAD * 90 },
        ease: 'Expo.easeIn',
        duration: 7000,
        repeat: -1,
        yoyo: false,
      }).seek(5000).pause();
      tunnelTweens.push(tween);
    }

    this.time.addEvent({
      delay: 2500,
      loop: false,
      callback: () => {
        for (let i = 0; i < tunnelTweens.length; i++) {
          tunnelTweens[i].resume();
        }
      }
    });

    let scene = this;
    this.tweens.chain({
      delay: 1000,
      tweens: [
        {
          targets: bat,
          y: GAME_HEIGHT / 2 + 75,
          ease: 'QuadInOut',
          duration: 1500,
          repeat: 0,
          yoyo: false,
          onComplete: function () {
            scene.sound.play("tunnel");
          }
        },
        {
          targets: bat,
          scale: { from: 1, to: 0 },
          ease: 'ExpoOut',
          duration: 2000,
          repeat: 0,
          yoyo: false,
        },
        {
          // this is just for timing the scene transition with the other tweens
          targets: bat,
          alpha: 0,
          duration: 1000,
          repeat: 0,
          yoyo: false,
          onComplete: function() {
            scene.game.scene.stop('EndOfGame');
            if (data.clues > 0) {
              scene.game.scene.start('ClueReveal', {
                clues: data.clues,
                playerWon: true,
              });
            } else {
              handoffToFrontEnd();
            }
          }
        }
      ]
    });

    this.tweens.chain({
      delay: 2000,
      tweens: [
        {
          targets: [ top, ground, zombie1, zombie2 ],
          alpha: { from: 1, to: 0 },
          ease: 'Quad',
          duration: 600,
          repeat: 0,
          yoyo: false,
        },
        {
          targets: [ bottom ],
          alpha: { from: 1, to: 0 },
          ease: 'Quad',
          duration: 800,
          repeat: 0,
          yoyo: false,
        }
      ]
    });

    this.tweens.add({
      targets: container,
      y: { from: -300, to: 200 },
      ease: 'Expo',
      duration: 4000,
      repeat: 0,
      yoyo: false,
    });

    this.sound.play("win");
  }
});

game.scene.add('GameOver', {
  create: function (data) {
    let ghost1 = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT, "go-ghost1")
      .setScale(0).setRotation(Phaser.Math.DEG_TO_RAD * -45);
    let ghost2 = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT, "go-ghost2")
      .setScale(0).setRotation(Phaser.Math.DEG_TO_RAD * 45);

    this.tweens.add({
      targets: ghost1,
      x: GAME_WIDTH / 2 + 25,
      ease: 'Quad',
      duration: 1000,
      repeat: 0,
      yoyo: false,
    });

    this.tweens.add({
      targets: ghost2,
      x: GAME_WIDTH / 2 - 25,
      ease: 'Quad',
      duration: 1000,
      repeat: 0,
      yoyo: false,
    });

    this.tweens.add({
      targets: [ghost1, ghost2],
      y: GAME_HEIGHT / 2 - 50,
      ease: 'Expo',
      duration: 1500,
      repeat: 0,
      yoyo: false,
    });
    
    this.tweens.add({
      targets: [ghost1, ghost2],
      scale: 1,
      ease: 'Expo',
      duration: 700,
      repeat: 0,
      yoyo: false,
    });

    this.tweens.add({
      targets: [ghost1, ghost2],
      rotation: 0,
      ease: 'Quad',
      duration: 500,
      repeat: 0,
      yoyo: false,
    });
    
    this.add.image(0, GAME_HEIGHT, "go-grass").setOrigin(0, 1);

    let goText = this.add.text(GAME_WIDTH / 2 - 75, GAME_HEIGHT / 2 + 25, "Game over!", { 
      align: "center", stroke: "#000000", color: "#ffffff",
      fontSize: 50, strokeThickness: 4, fontFamily: "FantaPop"
    }).setAlpha(0).setScale(0.8).setOrigin(0,0);

    this.tweens.add({
      targets: goText,
      delay: 500,
      x: goText.x - 22,
      scale: 1,
      ease: 'Quad',
      duration: 1000,
      repeat: 0,
      yoyo: false,
    });

    this.tweens.add({
      targets: goText,
      delay: 500,
      alpha: 1,
      ease: 'ExpoIn',
      duration: 1000,
      repeat: 0,
      yoyo: false,
    });

    let scene = this;
    let continueToNextScreen = function () {
      scene.game.scene.stop('GameOver');
      if (data.clues > 0) {
        scene.game.scene.start('ClueReveal', {
          clues: data.clues,
          playerWon: false,
        });
      } else {
        handoffToFrontEnd();
      }
    };

    this.sound.play("lose");

    // delay before adding call back so users don't accidentally restart right away
    this.time.addEvent({
      delay: 3000, // wait for lose stinger to finish
      loop: false,
      callback: () => {
        if (this.sys.game.device.os.desktop) {
          this.input.keyboard.on('keydown', continueToNextScreen);
        } else {
          this.input.on('pointerdown', continueToNextScreen);
        }
      }
    });

    // auto progress after some time
    this.time.addEvent({
      delay: 7000,
      loop: false,
      callback: continueToNextScreen,
    });
  },
});

game.scene.add('ClueReveal', {
  create: function (data) {
    let lightObjects = [];

    this.add.image(0, 0, "clue-reveal-bg").setOrigin(0, 0);
    
    let bottleLight = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, "bottle-light");
    lightObjects.push(bottleLight);

    // controlled randomization of clues
    let clueKeyArray = [
      ["clue1", "clue2", "clue3"],
      ["clue1", "clue2", "clue3"],
      ["clue2", "clue1", "clue3"],
      ["clue2", "clue1", "clue3"],
      ["clue3", "clue2", "clue1"],
      ["clue3", "clue2", "clue1"],
      ["clue1", "clue3", "clue2"],
      ["clue1", "clue3", "clue2"],
      ["clue2", "clue3", "clue1"],
      ["clue2", "clue3", "clue1"],
      ["clue3", "clue1", "clue2"],
      ["clue3", "clue1", "clue2"],
    ];

    let clueArrayIndex = 0;
    let clueArrayIndexStr = localStorage.getItem("clueArrayIndex");
    if (clueArrayIndexStr != null) {
      clueArrayIndex = parseInt(clueArrayIndexStr);
    }

    if (clueArrayIndex >= clueKeyArray.length) {
      clueArrayIndex = 0;
    }

    let clueKeys = clueKeyArray[clueArrayIndex];
    localStorage.setItem("clueArrayIndex", clueArrayIndex + 1);

    let clueYPos = GAME_HEIGHT / 2 - 130;
    let clueSpacing = 60;
    if (data.clues >= 3) {
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos, clueKeys[0]));
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos + clueSpacing, clueKeys[1]));
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos + clueSpacing * 2, clueKeys[2]));
    } else if (data.clues >= 2) {
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos + (clueSpacing / 2), clueKeys[0]));
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos + (clueSpacing / 2) + clueSpacing, clueKeys[1]));
    } else if (data.clues >= 1) {
      lightObjects.push(this.add.image(GAME_WIDTH / 2, clueYPos + clueSpacing, clueKeys[0]));
    }

    let lightObjectsContainer = this.add.container(0, 0, lightObjects);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, "clue-reveal-bottle");
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, "new-clues");

    let ctaLabel = "TAP TO CONTINUE";
    if (this.sys.game.device.os.desktop) {
      ctaLabel = "PRESS ANY KEY";
    }

    let ctaText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, ctaLabel,
      { align: "center", fontSize: 18, strokeThickness: 0, fontFamily: "FantaPop" }
    ).setAlpha(0).setOrigin(0.5, 0.5);
    
    let shapeYPos = GAME_HEIGHT / 2 + 70;
    let shape = this.make.graphics()
    // let shape = this.add.graphics()
      .fillStyle(0xffffff, 1)
      .beginPath()
      .moveTo(GAME_WIDTH / 2, shapeYPos)
      .arc(GAME_WIDTH / 2, shapeYPos, 600, 0, 0, true)
      .closePath()
      .fillPath();
    shape.left = 0;
    shape.right = 359;
    var mask = lightObjectsContainer.createGeometryMask(shape);
    lightObjectsContainer.setMask(mask);

    this.tweens.add({
      targets: shape,
      left: { from: -90, to: 0 },
      right: { from: 270, to: 180 },
      ease: 'Quad',
      duration: 3000,
      repeat: 0,
      yoyo: false,
      onUpdate: function (tween, target, key, current, previous, param) {
        shape.clear()
          .fillStyle(0xffffff, 1)
          .beginPath()
          .moveTo(GAME_WIDTH / 2, shapeYPos)
          .arc(GAME_WIDTH / 2, shapeYPos, 600, Phaser.Math.DEG_TO_RAD * shape.left, Phaser.Math.DEG_TO_RAD * shape.right, true)
          .closePath()
          .fillPath();
      }
    });

    this.tweens.add({
      targets: ctaText,
      delay: 1500, 
      alpha: { from: 0, to: 1 },
      ease: 'Quad',
      duration: 500,
      repeat: 0,
      yoyo: false,
    });

    let scene = this;
    let continueToNextScreen = function () {
      scene.game.scene.stop('ClueReveal');
      handoffToFrontEnd(data.playerWon);
    };

    this.sound.play("clue-reveal");

    // add listeners after animation finishes so users don't accidentally skip it
    this.time.addEvent({
      delay: 1500,
      loop: false,
      callback: () => {
        if (this.sys.game.device.os.desktop) {
          this.input.keyboard.on('keydown', continueToNextScreen);
        } else {
          this.input.on('pointerdown', continueToNextScreen);
        }
      }
    });
  }
});

let isGameReady = false;
let isPageReady = false;
function startGame() {
  console.log("game started!");
  isPageReady = true;
  if (isGameReady) {
    let activeScenes = game.scene.getScenes(true);
    for (let i = 0; i < activeScenes.length; i++) {
      game.scene.stop(activeScenes[i]);
    }
    game.scene.start('WaitForInput');
  }
}
window.startGame = startGame;

function handoffToFrontEnd(playerWon) {
  if (DEBUG_LOCAL_MODE) {
    startGame();
    return;
  }

  console.log("handed off to page");
  if (playerWon) {
    window.open("/score", "_self");
  } else {
    window.open("/retry", "_self");
  }
}

function createLightContainer(scene) {
  let lightTex = scene.add.image(0, 0, "atlas", "light");
  let halfWidth = lightTex.width / 2;
  let halfHeight = lightTex.height / 2;
  let color = "0x000000";
  let container = scene.add.container(0, 0, [
    lightTex,
    // top
    scene.add.rectangle(
      -GAME_WIDTH * 2, -GAME_HEIGHT * 2 - halfHeight, 
      GAME_WIDTH * 4, GAME_HEIGHT * 2 + 2,
      color
    ).setOrigin(0, 0),
    // left
    scene.add.rectangle(
      -GAME_WIDTH * 2 - halfWidth, -halfHeight, 
      GAME_WIDTH * 2 + 2, lightTex.height,
      color
    ).setOrigin(0, 0),
    // right
    scene.add.rectangle(
      halfWidth - 2, -halfHeight, 
      GAME_WIDTH * 2 - halfWidth + 2, lightTex.height,
      color
    ).setOrigin(0, 0),
  ]).setDepth(LAYER_LIGHT).setAlpha(DEBUG_LIGHT).setScale(0.5);
  return container;
}

// bypass phaser's input system so that we can specify the passive property
// which appears to fix the input dropping issue on iOS
document.body.addEventListener('touchstart', function (event) {
  if (!game.scene.isActive("Game")) {
    return;
  }
  game.scene.getScene("Game").pageTouchStart(event);
}, { passive: true });

document.body.addEventListener('touchend', function (event) {
  if (!game.scene.isActive("Game")) {
    return;
  }
  game.scene.getScene("Game").pageTouchEnd(event);
}, { passive: true });

document.body.addEventListener('touchmove', function (event) {
  if (!game.scene.isActive("Game")) {
    return;
  }
  game.scene.getScene("Game").pageTouchMove(event);
}, { passive: true });
