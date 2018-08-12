// ExIST - A space themed survival game. My first browser based HTML5 game made with canvas!
// Taylor A. Leach - 2017

//******************************
// GLOBAL VARIABLES
//******************************
var canvas = document.getElementById("canvas");
var drawingSurface = canvas.getContext("2d");

drawingSurface.canvas.width = window.innerWidth;
drawingSurface.canvas.height = window.innerHeight;

var gameOverToast = document.getElementById('gameOver');
var replayForm = document.getElementById('replayForm');
var yourTime = document.getElementById('yourTime');
var pausedToast = document.getElementById("pause-toast");
var controlsToast = document.getElementById("controls-toast");
var controls = document.getElementById("controls");
var milestoneToast = document.getElementById("milestone-toast");
var title = document.getElementById("title");

//Arrow key codes
var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;
var PAUSE = 80;

//Directions
var moveUp = false;
var moveDown = false;
var moveRight = false;
var moveLeft = false;

// gameplay adjustments
var playerSpeed = 4;
var milestoneSeconds;
var milestoneMinutes;

// speed of the clock powerup
var timerPowerup = 0.5;
// spawn the clock at a random time between 5-30 seconds
function clockSpawnDelay() {
  var x = Math.floor((Math.random() * 30000) + 5000);
  return x;
}
// how long the powerup lasts
var clockDuration = 5000;
var clock = {
  active: false,
  timer: false,
};

var gameRunning = true;
var paused = true;
// start with paused = true because the controlsDelay function will set to false 
// after controls have been displayed on screen.

// spawn asteroids just outside of canvas edges
var canvasBuffer = 1000;

//******************************
// GAME OVER LOGIC
//******************************
function gameOver() {
  canvas.style.display = "none";
  gameOverToast.style.display = "block";
  controls.style.display = "none";
  controlsToast.style.display = "none";
  title.style.display = "none";
  replayForm.style.display = "block";
  gameRunning = false;
  var updateTime = document.getElementById('time').innerHTML;
  yourTime.innerHTML = "Your score: " + updateTime;
}

// every milestone, clear off all asteroids and respawn them offscreen and they will
// enter again and the game continues. (used in the switch statement in at the bottom of the game loop)
function milestoneFunction() {
  for (var n = 0; n < asteroids.length; n++) {
    asteroids[n].x = Math.floor((Math.random() * canvas.width));
    asteroids[n].y = Math.floor((Math.random() * canvas.height)) - canvasBuffer;
  }
  for (var n = 0; n < asteroidsFromRight.length; n++) {
    asteroidsFromRight[n].x = Math.floor((Math.random() * canvas.width)) + canvasBuffer;
    asteroidsFromRight[n].y = Math.floor((Math.random() * canvas.height)) + canvasBuffer;
  }
}

// FOR INSTRUCTIONS AT BEGINNING OF GAME
function controlsDelay() {
  paused = false;
  controls.style.transition = "opacity 5s";
  controls.style.opacity = 0;

  controlsToast.style.transition = "opacity 5s";
  controlsToast.style.opacity = 0;

  title.style.transition = "opacity 5s";
  title.style.opacity = 0;
}
setTimeout(controlsDelay, 3000);

//******************************
// SPRITE OBJECT
//******************************
var spriteObject = {
  sourceX: 0,
  sourceY: 0,
  sourceWidth: 0,
  sourceHeight: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,

  //Getters
  centerX: function () {
    return this.x + (this.width / 2);
  },
  centerY: function () {
    return this.y + (this.height / 2);
  },
  halfWidth: function () {
    return this.width / 2;
  },
  halfHeight: function () {
    return this.height / 2;
  }
};

//******************************
// MAIN PROGRAM
//******************************
// arrays to store different types of sprites
var sprites = [];
var asteroids = [];
var asteroidsFromRight = [];

createLargeAsteroids(20, true);
createLargeAsteroids(20, false);
createSmallAsteroids(10, true);
createSmallAsteroids(20, false);

// The values passed in are specific to the sprite sheet and match the size of the asteroid sprites.
function createAsteroid(x, y, width, height, speed) {
  var asteroid = Object.create(spriteObject);
  asteroid.sourceX = x;
  asteroid.sourceY = y;
  asteroid.sourceWidth = width;
  asteroid.sourceHeight = height;
  asteroid.width = width;
  asteroid.height = height;
  asteroid.speed = Math.floor((Math.random() * speed) + 1);
  asteroid.x = Math.floor((Math.random() * canvas.width));
  asteroid.y = Math.floor((Math.random() * canvas.width)) - canvasBuffer;
  return asteroid;
}

function createLargeAsteroids(x, fromLeft) {
  for (var i = 0; i <= x; i++) {
    var asteroid = createAsteroid(119, 0, 85, 76, 3);
    sprites.push(asteroid);
    if (fromLeft) {
      asteroids.push(asteroid);
    } else {
      asteroidsFromRight.push(asteroid);
    }
    // asteroids.push(asteroid);
  }
}

// True from left, false from right.
function createSmallAsteroids(x, fromLeft) {
  for (var i = 0; i <= x; i++) {
    var asteroid = createAsteroid(206, 0, 44, 43, 5);

    sprites.push(asteroid);
    if (fromLeft) {
      asteroids.push(asteroid);
    } else {
      asteroidsFromRight.push(asteroid);
    }
  }
}

//Create the Main Player 
var mainPlayer = Object.create(spriteObject);
mainPlayer.sourceX = 0;
mainPlayer.sourceY = 0;
mainPlayer.sourceWidth = 20;
mainPlayer.sourceHeight = 25;
mainPlayer.width = 20;
mainPlayer.height = 25;
mainPlayer.x = (canvas.width / 2) - mainPlayer.halfWidth(); // center player
mainPlayer.y = (canvas.height / 2) - mainPlayer.halfWidth(); // center player
sprites.push(mainPlayer);

//Create the clock power up 
function initClock() {
  clock = Object.create(spriteObject);
  clock.active = true;
  clock.sourceX = 25;
  clock.sourceY = 45;
  clock.sourceWidth = 25;
  clock.sourceHeight = 35;
  clock.width = 25;
  clock.height = 35;
  clock.speed = 1;
  clock.x = Math.floor(Math.random() * (canvas.width - clock.width));
  clock.y = Math.floor(Math.random() * (canvas.height - clock.height));
  clock.direction = {
    x: (function () {
      var posOrNeg = [-1, 1];
      return posOrNeg[Math.floor((Math.random() * posOrNeg.length))];
    })(),
    y: (function () {
      var posOrNeg = [-1, 1];
      return posOrNeg[Math.floor((Math.random() * posOrNeg.length))];
    })()
  };
  sprites.push(clock);
}

function changeSpriteDirection(sprite, x, width) {
  sprite.sourceX = x;
  sprite.sourceWidth = width;
  sprite.width = width;
}

//Load the sprite sheet
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "SpriteSheetEXIST.png";

// keyboard listeners
window.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case UP:
      moveUp = true;
      break;
    case DOWN:
      moveDown = true;
      break;
    case LEFT:
      moveLeft = true;
      break;
    case RIGHT:
      moveRight = true;
      break;
    case PAUSE:
      togglePaused();
      break;
  }
}, false);

window.addEventListener("keyup", function (event) {
  switch (event.keyCode) {
    case UP:
      moveUp = false;
      break;
    case DOWN:
      moveDown = false;
      break;
    case LEFT:
      moveLeft = false;
      break;
    case RIGHT:
      moveRight = false;
      break;
  }
}, false);

window.addEventListener("blur", function () {
  if (!paused) {
    togglePaused();
  }
});

function togglePaused() {
  paused = !paused;
  if (paused && gameRunning) {
    pausedToast.style.transition = "opacity 1s";
    pausedToast.style.opacity = 1;
    canvas.style.opacity = 0.6;
  } else {
    pausedToast.style.transition = "opacity 0.1s";
    pausedToast.style.opacity = 0;
    canvas.style.opacity = 1;
  }
}

function loadHandler() {
  update();
}

function update() {
  if (paused) {
    setTimeout(function () {
      requestAnimationFrame(update, canvas);
    }, 200);
  } else {
    requestAnimationFrame(update, canvas);

    //Up
    if (moveUp && !moveDown) {
      mainPlayer.vy = -playerSpeed;
      changeSpriteDirection(mainPlayer, 0, 20);
    }
    //Down
    if (moveDown && !moveUp) {
      mainPlayer.vy = playerSpeed;
      changeSpriteDirection(mainPlayer, 75, 22);
    }
    //Left
    if (moveLeft && !moveRight) {
      mainPlayer.vx = -playerSpeed;
      changeSpriteDirection(mainPlayer, 47, 26);
    }
    //Right
    if (moveRight && !moveLeft) {
      mainPlayer.vx = playerSpeed;
      changeSpriteDirection(mainPlayer, 20, 26);
    }

    // reset speed to 0 if no key is pressed
    if (!moveUp && !moveDown) {
      mainPlayer.vy = 0;
    }

    if (!moveLeft && !moveRight) {
      mainPlayer.vx = 0;
    }

    if (!clock.active && !clock.timer) {
      setTimeout(initClock, clockSpawnDelay());
      clock.timer = true;
    }

    // Clock movement
    if (clock.active) {
      clock.x += clock.speed * clock.direction.x;
      clock.y += clock.speed * clock.direction.y;

      // stop clock from leaving canvas
      if (clock.x >= canvas.width - clock.width) {
        clock.direction.x = -clock.direction.x;
      } else if (clock.x <= 0) {
        clock.direction.x = -clock.direction.x;
      } else if (clock.y >= canvas.height - clock.height) {
        clock.direction.y = -clock.direction.y;
      } else if (clock.y <= 0) {
        clock.direction.y = -clock.direction.y;
      }
    }

    // Main player movement
    mainPlayer.x += mainPlayer.vx;
    mainPlayer.y += mainPlayer.vy;

    // stop player from leaving canvas edges
    if (mainPlayer.x > canvas.width - mainPlayer.width) {
      mainPlayer.x = (canvas.width - mainPlayer.width);
    }
    if (mainPlayer.x < 0) {
      mainPlayer.x = 0;
    }
    if (mainPlayer.y > canvas.height - mainPlayer.height) {
      mainPlayer.y = (canvas.height - mainPlayer.height);
    }
    if (mainPlayer.y < 0) {
      mainPlayer.y = 0;
    }

    // asteroid movement
    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].x += asteroids[i].speed;
      asteroids[i].y += asteroids[i].speed;

      if (asteroids[i].x > canvas.width) {
        asteroids[i].x = Math.floor((Math.random() * -canvasBuffer) + 1);
        asteroids[i].y = Math.floor((Math.random() * -canvasBuffer) + 1);
      }
    }

    // asteroids from right movement
    for (var i = 0; i < asteroidsFromRight.length; i++) {
      asteroidsFromRight[i].x -= asteroidsFromRight[i].speed;
      asteroidsFromRight[i].y -= asteroidsFromRight[i].speed;
      if (asteroidsFromRight[i].x < -canvasBuffer) {
        asteroidsFromRight[i].x = canvas.width + Math.floor((Math.random() * canvasBuffer));
        asteroidsFromRight[i].y = canvas.width + Math.floor((Math.random() * canvasBuffer));
      }
    }

    //******************************
    // COLLISION DETECTION ON MAIN PLAYER
    //******************************
    detectCollision(mainPlayer, asteroids);
    detectCollision(mainPlayer, asteroidsFromRight);

    function detectCollision(player, asteroids) {
      for (var i = 0; i < asteroids.length; i++) {
        if (player.x > asteroids[i].x &&
          player.x < (asteroids[i].x + asteroids[i].width) &&
          player.y > asteroids[i].y &&
          player.y < (asteroids[i].y + asteroids[i].width)) {
          gameOver();
        }
      }
    }

    // clock collision with main player
    if (clock.active) {
      if (mainPlayer.x + mainPlayer.width > clock.x &&
        mainPlayer.x < clock.x + clock.width &&
        mainPlayer.y + mainPlayer.height > clock.y &&
        mainPlayer.y < clock.y + clock.width) {

        clock = null;
        clock = {
          active: false,
          timer: false
        };
        sprites.pop();

        // make all asteroids slow down for x amount of seconds and respawn the powerup
        for (var i = 0; i < sprites.length; i++) {
          sprites[i].speed = timerPowerup;
          window.setTimeout(function () {
            for (var i = 0; i < sprites.length; i++) {
              sprites[i].speed = Math.floor((Math.random() * 4) + 1);
              clock.speed = 1;
            }
          }, clockDuration);
        }
      }
    }

    // call game timer
    if (gameRunning) {
      checkTime();
    }

    // adjust milestone increment here. clears the screen of all asteroids and presents the user with a confidence boosting message.
    // currently set to 30s, 1m, & 1m30s
    if (milestoneSeconds == 30) {
      milestoneToast.innerHTML = "MUCH GOOD!";
      canvas.style.transition = "all 0.5s";
      canvas.style.filter = "blur(5px)";
      milestoneFunction();
    } else if (milestoneSeconds === 0 && milestoneMinutes == 1) {
      milestoneToast.innerHTML = "VERY WOW!";
      canvas.style.transition = "all 0.5s";
      canvas.style.filter = "blur(5px)";
      milestoneFunction();
    } else if (milestoneSeconds === 30 && milestoneMinutes == 1) {
      milestoneToast.innerHTML = "SUCH SUCCESS!";
      canvas.style.transition = "all 0.5s";
      canvas.style.filter = "blur(5px)";
      milestoneFunction();
    } else {
      milestoneToast.innerHTML = "";
      canvas.style.transition = "all 0.5s";
      canvas.style.filter = "blur(0)";
    }

    //Render the sprites
    render();
  }
}

//******************************
// TIMER
//****************************** 
var initialTime = Date.now();

function checkTime() {
  var timeDifference = Date.now() - initialTime;
  var formatted = convertTime(timeDifference);
  document.getElementById('time').innerHTML = '' + formatted;
}

function convertTime(miliseconds) {
  var totalSeconds = Math.floor(miliseconds / 1000);
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds - minutes * 60;
  milestoneSeconds = seconds;
  milestoneMinutes = minutes;
  return minutes + ':' + seconds + ":" + miliseconds;
}

function render() {
  // clear canvas
  drawingSurface.clearRect(0, 0, canvas.width, canvas.height);

  //Loop through all the sprites and use 
  //their properties to display them
  if (sprites.length !== 0) {
    for (var i = 0; i < sprites.length; i++) {
      var sprite = sprites[i];
      drawingSurface.drawImage(
        image,
        sprite.sourceX, sprite.sourceY,
        sprite.sourceWidth, sprite.sourceHeight,
        Math.floor(sprite.x), Math.floor(sprite.y),
        sprite.width, sprite.height
      );
    }
  }
}