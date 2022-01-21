var windowWidth = window.innerWidth;
var width = windowWidth / 2;
var rise, run; // for angle calculations
var radiansAngle = 0;
var angle = 0;
var gunCanvasDistanceFromTop, gunCanvasDistanceFromSide;
var canvasWidth, canvasHeight;
var sidebarWidth; // size of the bars outside the game screen on either side
var gunImageWidth = 90;
var gunImageHeight = 50;
var playerImageWidth = 96;
var playerImageHeight = 81;
var turretWidth = 80;
var turretHeight = 160;
var tankWidth = 180;
var tankHeight = 100;
var healthWidth = 60;
var healthHeight = 48;
var mousePosX, mousePosY;
var gunSprite;
var playerSprite;
var playerHealth = 300;
var bulletStorage = [];
var enemyBulletStorage = [];
var turretStorage = [];
var tankStorage = [];
var healthStorage = [];
var weaponDelay = 0;
var ctx;
var idle = true;
var jumping = false;
var running = false;
var crouching = false;
var idleCounter = 0;
var jumpingCounter = 0;
var runningCounter = 0;
var crouchDistance = 0;
var round = 0;
var roundTextCounter = 0;
var createEnemies = true;
var healthOnScreen = true;
var tankCounter = 0;
var nextRound = 0;


  function startGame() {
      getMousePosition();
      myGameArea.start();
      document.getElementById("PlayButton").style.display = "none";
      document.getElementById("titleScreen").style.display = "none";
      document.getElementById("titleScreen2").style.display = "none";
      document.getElementById("mainScreen").style.display = "block";
      gunSprite = new gunComponent(gunImageWidth, gunImageHeight, canvasWidth / 2, canvasHeight / 2);
      playerSprite = new playerComponent(playerImageWidth, playerImageHeight, canvasWidth / 2, canvasHeight / 2);
      turret1 = new enemyTurret(turretWidth, turretHeight, 55, 400);
      turret2 = new enemyTurret(turretWidth, turretHeight, 1075, 400);
      turret3 = new enemyTurret(turretWidth, turretHeight, 55, 121);
      turret4 = new enemyTurret(turretWidth, turretHeight, 1075, 108);
  }

  function updateGameArea() {
      myGameArea.clear();
      drawBackground();
      gunSprite.speedX = 0;
      gunSprite.speedY = 0;
      playerSprite.speedX = 0;
      playerSprite.speedY = 0;
      playerSprite.width = playerImageWidth;
      playerSprite.height = playerImageHeight;
      idle = true; jumping = false; running = false; crouching = false; crouchDistance = 0;
      if (myGameArea.keys && (myGameArea.keys[40] || myGameArea.keys[83])) {idle = false; crouching = true; running = false;}
      if (myGameArea.keys && (myGameArea.keys[37] || myGameArea.keys[65])) {idle = false; running = true; if (crouching == false) {if (gunCanvasDistanceFromSide > 0) {playerSprite.speedX = -4; gunSprite.speedX = -4;}}}
      if (myGameArea.keys && (myGameArea.keys[39] || myGameArea.keys[68])) {idle = false; running = true; if (crouching == false) {if (gunCanvasDistanceFromSide < canvasWidth) {playerSprite.speedX = 4; gunSprite.speedX = 4;}}}
      if (myGameArea.keys && (myGameArea.keys[38] || myGameArea.keys[87])) {idle = false; jumping = true; running = false; if (jumpingCounter == 0) {jumpingCounter = 1;}}
      if (myGameArea.keys && (myGameArea.keys[40] || myGameArea.keys[83])) {idle = false; crouching = true; running = false; clearInterval(mouseInterval);}


      ownBulletCheck();
      enemyBulletCheck();
      healthSpriteCheck();


      //shooting
      if (myGameArea.keys && myGameArea.keys[32]) {
        if ((crouching == true) && (jumping == false)) {
        } else {
          gunSprite.shoot();
        }
      }



      enemyBulletStorage = enemyBulletStorage.filter(function(bullet) {
        return bullet.active;
      });

      enemyBulletStorage.forEach(function(bullet) {
          bullet.update();
          bullet.draw();
      });

      turretStorage.forEach(function(turret) {
        turret.draw();
        turret.shoot();
      });

      tankStorage.forEach(function(tank) {
        tank.draw();
        tank.shoot();
      });

      bulletStorage.forEach(function(bullet) {
          bullet.update();
      });

      bulletStorage = bulletStorage.filter(function(bullet) {
        return bullet.active;
      });

      if(weaponDelay > 0) {
        weaponDelay -= 10;}

      bulletStorage.forEach(function(bullet) {
        bullet.draw();
      });

      updateHealth();
      updateRound();
      roundText();
      gunSprite.newPos();
      playerSprite.update();
      gunSprite.update();

      if ((turretStorage.length == 0) && (tankStorage.length == 0)) {
        nextRound += 1;
      }
      if (nextRound == 1) {
        roundTextCounter = 1;
        round += 1;
        var timer = setTimeout(newRound, 911);
        healthOnScreen = false;
        tankCounter = Math.floor(Math.random() * 2) + 1;
      }

      if (crouching == true) {
        gunCanvasDistanceFromTop -= crouchDistance;
      }

      //health sprite
      if ((((round != 0) && ((round % 5) == 0)) || (round == 2)) && (healthOnScreen == false)) {
        createHealth();
        healthOnScreen = true;
      }
      healthStorage = healthStorage.filter(function(health) {
        return health.active;
      });
      healthStorage.forEach(function(health) {
          health.draw();
      });

  }

  function updateHealth() {
    ctx.font = "20pt Calibri";
    ctx.fillStyle = "black";
    ctx.fillText("Health: " + playerHealth, 180, 50);
  }
  function updateRound() {
    ctx.font = "20pt Calibri";
    ctx.fillStyle = "white";
    ctx.fillText("Round: " + round, 900, 50);
  }
  function roundText() {
    if ((roundTextCounter > 0) && (roundTextCounter < 50)) {
      ctx.font = "60pt Montserrat";
      ctx.fillStyle = "white";
      ctx.fillText("ROUND " + round, 420, 160);
      roundTextCounter += 1;
    } else {
      roundTextCounter = 0;
    }

  }


  var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
      this.canvas.width = 1200;
      this.canvas.height = 600;
      canvasWidth = 1200;
      canvasHeight = 600;
      this.ctx = this.canvas.getContext("2d");
      ctx = ctx = myGameArea.canvas.getContext("2d");
      //background image
      var background = new Image();
      background.src = "./images/Background.png";
      background.onload = function(){
          ctx.drawImage(background,0,0);
      }
      //
      document.getElementById("mainScreen").appendChild(this.canvas);
      this.interval = setInterval(updateGameArea, 20);
      window.addEventListener('keydown', function (e) {
          myGameArea.keys = (myGameArea.keys || []);
          myGameArea.keys[e.keyCode] = (e.type == "keydown");
      })
      window.addEventListener('keyup', function (e) {
          myGameArea.keys[e.keyCode] = (e.type == "keydown");
      })

      sidebarWidth = width - (canvasWidth / 2);
      gunCanvasDistanceFromTop = 520;
      gunCanvasDistanceFromSide = canvasWidth / 2;
      gunScreenPosX = gunCanvasDistanceFromSide + sidebarWidth;
      gunScreenPosY = gunCanvasDistanceFromTop + 75; //75 is the margin-top

  },
  clear : function() {
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }
}

function drawBackground() {
var background = new Image();
background.src = "./images/Background.png";
ctx.drawImage(background,0,0);
}

function endGame() {
clearInterval(myGameArea.interval);
setTimeout(function() {
  document.getElementById("mainScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "block";
}, 1500);
}

function gunComponent(width, height, x, y) {
  this.gamearea = myGameArea;
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 1;
  this.x = x;
  this.y = y;
  this.active = true;

  this.update = function() {
      ctx = myGameArea.canvas.getContext("2d");
      gunScreenPosX = gunCanvasDistanceFromSide + sidebarWidth;
      gunScreenPosY = gunCanvasDistanceFromTop + 75; //75 is the margin-top

      run = mousePosX - gunScreenPosX;
      rise = mousePosY - gunScreenPosY;
      radiansAngle = Math.atan2(rise, run);
      angle = radiansAngle * 180 / Math.PI;

      var gunImg = new Image();
      if (mousePosX >= gunScreenPosX) {
        gunImg.src = './images/Gun.png';
      } else {
        gunImg.src = './images/Gun2.png';
        angle = angle + 180;
      }

      ctx.save();
      ctx.translate((gunCanvasDistanceFromSide), (gunCanvasDistanceFromTop + 3));
      ctx.rotate(angle * Math.PI / 180);
      ctx.drawImage(gunImg, -1/2 * this.width, -1/2 * this.height, this.width, this.height);
      ctx.restore();

  }
  this.newPos = function() {
        gunCanvasDistanceFromSide += this.speedX;

      //jump code
      if ((jumpingCounter > 0) && (jumpingCounter <= 22)) { //distance
        idle = false; jumping = true;
        gunCanvasDistanceFromTop += -7; //speed
        jumpingCounter = jumpingCounter + 1;
      } else if ((jumpingCounter > 22) && (jumpingCounter <= 44)) {
        idle = false; jumping = true;
        gunCanvasDistanceFromTop -= -7;
        jumpingCounter = jumpingCounter + 1;
      } else if (jumpingCounter >= 44) {
        idle = false; jumping = true;
        jumpingCounter = 0;
      }
  }

}

function playerComponent(width, height, x, y) {
  this.gamearea = myGameArea;
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 1;
  this.x = x;
  this.y = y;
  this.active = true;

  this.update = function() {
      ctx = myGameArea.canvas.getContext("2d");

      var activeImage = new Image();
      if (idle == true) {
        if ((idleCounter >= 0) && (idleCounter < 30)) {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Idle1.png';
          } else {
            activeImage.src = './images/Idle1_Opposite.png';
          }
        } else if ((idleCounter >= 30) && (idleCounter < 60)) {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Idle2.png';
          } else {
            activeImage.src = './images/Idle2_Opposite.png';
          }
        } else {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Idle2.png';
          } else {
            activeImage.src = './images/Idle2_Opposite.png';
          }
          idleCounter = 0;
        }

        idleCounter += 1;

      } else if (jumping == true) {
        this.width = 90;
        this.height = 100;
        if (mousePosX >= gunScreenPosX) {
          activeImage.src = './images/Jumping.png';
        } else {
          activeImage.src = './images/Jumping_Opposite.png';
        }
      } else if (crouching == true) {
        this.width = 75;
        this.height = 67;
        crouchDistance = 10;
        gunCanvasDistanceFromTop += crouchDistance;
        if (mousePosX >= gunScreenPosX) {
          activeImage.src = './images/Crouching.png';
        } else {
          activeImage.src = './images/Crouching_Opposite.png';
        }
      } else if (running == true) {

        if ((runningCounter >= 0) && (runningCounter < 10)) {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Running1.png';
          } else {
            activeImage.src = './images/Running1_Opposite.png';
          }
        } else if (((runningCounter >= 10) && (runningCounter < 20)) || ((runningCounter >= 30) && (runningCounter < 40))) {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Running2.png';
          } else {
            activeImage.src = './images/Running2_Opposite.png';
          }
        } else if ((runningCounter >= 20) && (runningCounter < 30)) {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Running3.png';
          } else {
            activeImage.src = './images/Running3_Opposite.png';
          }
        } else {
          if (mousePosX >= gunScreenPosX) {
            activeImage.src = './images/Running2.png';
          } else {
            activeImage.src = './images/running2_Opposite.png';
          }
          runningCounter = 0;
        }

        runningCounter += 1;
      }

      ctx.save();
      ctx.translate((gunCanvasDistanceFromSide), (gunCanvasDistanceFromTop));
      ctx.drawImage(activeImage, -1/2 * this.width, -1/2 * this.height, this.width, this.height);
      ctx.restore();
  }

}

function getMousePosition() {
  var e = window.event;
  mousePosX = e.clientX;
  mousePosY = e.clientY;
}

function healthComponent(width, height, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.active = true;
  this.healthImage = new Image();
}

function createHealth() {
  var placeholder = new healthComponent(healthWidth, healthHeight, Math.floor(Math.random() * 800) + 200, 360);
  healthStorage.push(placeholder);
}

healthComponent.prototype.die = function() {
  this.active = false;
};

healthComponent.prototype.draw = function() {
  this.healthImage.src = "./images/HealthUp.png";
  ctx.drawImage(this.healthImage, this.x, this.y, this.width, this.height);
}

function Bullet(bullet) {
  this.active = true;
  this.color = "yellow";
  this.xVel = bullet.xVel * bullet.vel;
  this.yVel = bullet.yVel * bullet.vel;
  this.width = 5;
  this.height = 5;
  this.x = bullet.x;
  this.y = bullet.y;
}

Bullet.prototype.inBounds = function() {
  return this.x >= 0 && this.x <= canvasWidth &&
       this.y >= 0 && this.y <= canvasHeight;
};

Bullet.prototype.draw = function() {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

Bullet.prototype.update = function() {
  this.x += this.xVel;
  this.y += this.yVel;
  this.active = this.inBounds() && this.active;
};

Bullet.prototype.die = function() {
  this.active = false;
};

gunComponent.prototype.shoot = function() {
    if(weaponDelay === 0) {
      var cosTheta = Math.cos(radiansAngle);
      var sinTheta = Math.sin(radiansAngle);
      bulletStorage.push(new Bullet({
          xVel: cosTheta,
          yVel: sinTheta,
          vel: 7,
          x: gunCanvasDistanceFromSide,
          y: gunCanvasDistanceFromTop
      }));
      weaponDelay = 80;
    }
}

//ENEMY LOGISTICS

function enemyTurret(width, height, x, y) {
  this.active = true;
  this.width = width;
  this.height = height;
  this.x = x; //myGameArea.canvas.width * Math.random();
  this.y = y; //50
  this.turretDelay = 500;
  this.hp = 200;
  this.turretImage = new Image();
  this.hit = false;
}

enemyTurret.prototype.draw = function() {
  if (this.hit == true) {
    this.turretImage.src = "./images/TurretHit.png";
    ctx.drawImage(this.turretImage, this.x, this.y, this.width, this.height);
    this.hit = false;
  } else {
    this.turretImage.src = "./images/Turret.png";
    ctx.drawImage(this.turretImage, this.x, this.y, this.width, this.height);
  }
};

enemyTurret.prototype.die = function() {
this.active = false;
//score += 10;
};

enemyTurret.prototype.shoot = function() {
  if(this.turretDelay === 0) {
    var run2 = this.x + (this.width / 2) - gunCanvasDistanceFromSide;
    var rise2 = this.y + (this.height / 2) - gunCanvasDistanceFromTop - 30;
    var radiansAngle2 = Math.atan2(run2, rise2);
    var cosTheta = Math.cos(radiansAngle2);
    var sinTheta = Math.sin(radiansAngle2);
    enemyBulletStorage.push(new EnemyBullet({
        xVel: -sinTheta,
        yVel: -cosTheta,
        width: 8,
        height: 8,
        color: "red",
        damage: 1,
        vel: 6,
        x: this.x + (this.width / 2),
        y: this.y - 30 + (this.height / 2)
    }));
    this.turretDelay = 500;
  } else {
    this.turretDelay -= 10;
  }
}

function enemyTank(width, height, x, y) {
this.active = true;
this.width = width;
this.height = height;
this.x = x; //myGameArea.canvas.width * Math.random();
this.y = y; //50
this.tankDelay = 500;
this.hp = 200;
this.tankImage = new Image();
this.hit = false;
}

enemyTank.prototype.draw = function() {
if (this.hit == true) {
  if (tankCounter == 1) {
    this.tankImage.src = "./images/Tank1_Hit.png";
    ctx.drawImage(this.tankImage, this.x, this.y, this.width, this.height);
  } else {
    this.tankImage.src = "./images/Tank2_Hit.png";
    ctx.drawImage(this.tankImage, this.x, this.y, this.width, this.height);
  }
  this.hit = false;
} else {
  if (tankCounter == 1) {
    this.tankImage.src = "./images/Tank1.png";
    ctx.drawImage(this.tankImage, this.x, this.y, this.width, this.height);
  } else {
    this.tankImage.src = "./images/Tank2.png";
    ctx.drawImage(this.tankImage, this.x, this.y, this.width, this.height);
  }
}
};

enemyTank.prototype.die = function() {
this.active = false;
//score += 10;
};

enemyTank.prototype.shoot = function() {
if(this.tankDelay === 0) {
  if (tankCounter == 1) {
    enemyBulletStorage.push(new EnemyBullet({
        xVel: -3,
        yVel: 0,
        width: 10,
        height: 10,
        color: "blue",
        damage: 5,
        vel: 2,
        x: this.x + (this.width / 2),
        y: this.y + (this.height / 2) - 15
    }));
  } else {
    enemyBulletStorage.push(new EnemyBullet({
        xVel: 3,
        yVel: 0,
        width: 10,
        height: 10,
        color: "blue",
        damage: 5,
        vel: 2,
        x: this.x + (this.width / 2),
        y: this.y + (this.height / 2) - 15
    }));
  }
  this.tankDelay = 1100;
} else {
  this.tankDelay -= 10;
}
}

function EnemyBullet(bullet) {
this.active = true;
this.color = bullet.color;
this.xVel = bullet.xVel * bullet.vel;
this.yVel = bullet.yVel * bullet.vel;
this.width = bullet.width;
this.height = bullet.height;
this.x = bullet.x;
this.y = bullet.y;
this.damage = bullet.damage;
}

EnemyBullet.prototype.inBounds = function() {
return this.x >= 0 && this.x <= canvasWidth &&
       this.y >= 0 && this.y <= canvasHeight;
};

EnemyBullet.prototype.draw = function() {
ctx.fillStyle = this.color;
ctx.fillRect(this.x, this.y, this.width, this.height);
};

EnemyBullet.prototype.update = function() {
this.x += this.xVel;
this.y += this.yVel;
this.active = this.inBounds() && this.active;
};

EnemyBullet.prototype.die = function() {
this.active = false;
};



//COLLISION CHECKING AND HANDLING

function collisionCheckEnemy(a, b) { //collision checking and handling
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function ownBulletCheck() {
  bulletStorage.forEach(function(bullet) {
    turretStorage.forEach(function(enemy) {
      if (collisionCheckEnemy(bullet, enemy)) {

        bullet.die();
        enemy.hp -= 10;
        enemy.hit = true;

        if (enemy.hp == 0) {
          enemy.die();
          nextRound = 0;
          turretStorage = turretStorage.filter(function(turret) {
            return turret.active;
          });
        }
      }
    });
  });
  bulletStorage.forEach(function(bullet) {
    tankStorage.forEach(function(enemy) {
      if (collisionCheckEnemy(bullet, enemy)) {

        bullet.die();
        enemy.hp -= 10;
        enemy.hit = true;

        if (enemy.hp == 0) {
          enemy.die();
          nextRound = 0;
          tankStorage = tankStorage.filter(function(tank) {
            return tank.active;
          });
        }
      }
    });
  });
}

function collisionCheckSprite(a, b) { //collision checking and handling
  return a.x < gunCanvasDistanceFromSide - (playerImageWidth / 2) + b.width &&
         a.x + a.width > gunCanvasDistanceFromSide - (playerImageWidth / 2) &&
         a.y < gunCanvasDistanceFromTop - (playerImageHeight / 2)+ b.height &&
         a.y + a.height > gunCanvasDistanceFromTop - (playerImageHeight / 2);
}

function enemyBulletCheck() {
enemyBulletStorage.forEach(function(bullet) {
    if (collisionCheckSprite(bullet, playerSprite)) {
      if ((crouching == true) && (running == false) && (jumping == false)) {
        bullet.die();
      } else {
        bullet.die();
        if (bullet.damage == 1) {
          playerHealth -= 1;
        } else {
          playerHealth -= 5;
        }

      }

      if (playerHealth <= 0) {
        endGame();
      }
    }
});
}

function healthSpriteCheck() {
healthStorage.forEach(function(health) {
    if (collisionCheckSprite(health, playerSprite)) {
      health.die();
      playerHealth += 15;
    }
});
}

function newRound() {
createEnemies = false;
var newTurret1 = new enemyTurret(turretWidth, turretHeight, 55, 400);
var newTurret2 = new enemyTurret(turretWidth, turretHeight, 1075, 400);
var newTurret3 = new enemyTurret(turretWidth, turretHeight, 55, 121);
var newTurret4 = new enemyTurret(turretWidth, turretHeight, 1075, 108);
var newTank1 = new enemyTank(tankWidth, tankHeight, 840, 464);
var newTank2 = new enemyTank(tankWidth, tankHeight, 210, 464);
if (tankCounter == 1) {
  tankStorage.push(newTank1);
} else {
  tankStorage.push(newTank2);
}
turretStorage.push(newTurret1);
turretStorage.push(newTurret2);
turretStorage.push(newTurret3);
turretStorage.push(newTurret4);
document.getElementById("spanRound").innerHTML = round;
}

var mouseInterval;
function mouseShoot() {
if (crouching == false) {
mouseInterval = setInterval(gunSprite.shoot,10);
}}
function stopMouseShoot() {
clearInterval(mouseInterval);
}