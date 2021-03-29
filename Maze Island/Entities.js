var player;

Entity = function (type, id, x, y, width, height, img) {
  var self = {
    type: type,
    id: id,
    x: x,
    y: y,
    width: width,
    height: height,
    img: img,
  };
  self.update = function () {
    self.updatePosition();
    self.draw();
  };
  self.draw = function () {
    ctx.save();
    var x = self.x - player.x;
    var y = self.y - player.y;

    x += WIDTH / 2;
    y += HEIGHT / 2;

    x -= self.width / 2;
    y -= self.height / 2;

    ctx.drawImage(
      self.img,
      0,
      0,
      self.img.width,
      self.img.height,
      x,
      y,
      self.width,
      self.height
    );

    ctx.restore();
  };
  self.getDistance = function (entity2) {
    //return distance (number)
    var vx = self.x - entity2.x;
    var vy = self.y - entity2.y;
    return Math.sqrt(vx * vx + vy * vy);
  };

  self.testCollision = function (entity2) {
    //return if colliding (true/false)
    var rect1 = {
      x: self.x - self.width / 2,
      y: self.y - self.height / 2,
      width: self.width,
      height: self.height,
    };
    var rect2 = {
      x: entity2.x - entity2.width / 2,
      y: entity2.y - entity2.height / 2,
      width: entity2.width,
      height: entity2.height,
    };
    return testCollisionRectRect(rect1, rect2);
  };
  self.updatePosition = function () {};

  return self;
};

Player = function () {
  var self = Actor(
    "player",
    "myId",
    300,
    300,
    50 * 1.1,
    70 * 1.1,
    Img.player,
    10,
    0
  );

  self.maxMoveSpd = 8;
  self.pressingMouseLeft = false;
  self.pressingMouseRight = false;

  var super_update = self.update;
  self.update = function () {
    super_update();

    if (self.pressingRight)
      (self.spriteAnimCounter += 0.2), (self.aimAngle = 0), grasssound.play();
    if (self.pressingLeft)
      (self.spriteAnimCounter += 0.2), (self.aimAngle = 180), grasssound.play();
    if (self.pressingUp)
      (self.spriteAnimCounter += 0.2), (self.aimAngle = 270), grasssound.play();
    if (self.pressingDown)
      (self.spriteAnimCounter += 0.2), (self.aimAngle = 90), grasssound.play();

    if (player.pressingMouseRight) self.performSpecialAttack();
  };

  var super_draw = self.draw;
  self.draw = function () {
    super_draw();
    var x = self.x - player.x + WIDTH / 2;
    var y = self.y - player.y + HEIGHT / 2 - self.height / 2 - 20;

    ctx.save();
    ctx.fillStyle = "#40ff40";
    var width = (100 * self.hp) / self.hpMax;
    if (width < 0) width = 0;
    ctx.fillRect(x - 50, y, width, 10);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x - 50, y, 100, 10);

    ctx.restore();
  };

  self.onDeath = function () {
    playerdeath.play();
    islandmusic.stop();
    bossmusic.stop();
    startNewGame();
  };
  self.onDeath2 = function () {
    playerdeath.play();
    islandmusic.stop();
    bossmusic.stop();
    startNewGame2();
  };

  return self;
};

Actor = function (type, id, x, y, width, height, img, hp, atkSpd) {
  var self = Entity(type, id, x, y, width, height, img);

  self.hp = hp;
  self.hpMax = hp;
  self.atkSpd = atkSpd;
  self.attackCounter = 0;
  self.maxMoveSpd = 3;
  self.spriteAnimCounter = 0;

  self.pressingDown = false;
  self.pressingUp = false;
  self.pressingLeft = false;
  self.pressingRight = false;

  self.draw = function () {
    ctx.save();
    var x = self.x - player.x;
    var y = self.y - player.y;

    x += WIDTH / 2;
    y += HEIGHT / 2;

    x -= self.width / 2;
    y -= self.height / 2;

    var frameWidth = self.img.width / 4;
    var frameHeight = self.img.height / 4;

    var aimAngle = self.aimAngle;
    if (aimAngle < 0) aimAngle = 360 + aimAngle;

    var directionMod = 2; //draw right
    if (aimAngle >= 45 && aimAngle < 135)
      //down
      directionMod = 0;
    else if (aimAngle >= 135 && aimAngle < 225)
      //left
      directionMod = 1;
    else if (aimAngle >= 225 && aimAngle < 315)
      //up
      directionMod = 3;

    var walkingMod = Math.floor(self.spriteAnimCounter) % 4;

    ctx.drawImage(
      self.img,
      walkingMod * frameWidth,
      directionMod * frameHeight,
      frameWidth,
      frameHeight,
      x,
      y,
      self.width,
      self.height
    );

    ctx.restore();
  };

  self.updatePosition = function () {
    var leftBumper = { x: self.x - 20, y: self.y };
    var rightBumper = { x: self.x + 20, y: self.y };
    var upBumper = { x: self.x, y: self.y - 35 };
    var downBumper = { x: self.x, y: self.y + 37 };

    //////////////////////

    // shakinnnn but pushinnn

    /*
    if (Maps.current.isPositionWall(rightBumper)) {
      self.x -= 5;
    } else {
      if (self.pressingRight) self.x += self.maxMoveSpd;
    }
    if (Maps.current.isPositionWall(leftBumper)) {
      self.x += 5;
    } else {
      if (self.pressingLeft) self.x -= self.maxMoveSpd;
    }
    if (Maps.current.isPositionWall(downBumper)) {
      self.y -= 5;
    } else {
      if (self.pressingDown) self.y += self.maxMoveSpd;
    }
    if (Maps.current.isPositionWall(upBumper)) {
      self.y += 5;
    } else {
      if (self.pressingUp) self.y -= self.maxMoveSpd;
    }*/

    if (self.pressingRight && !Maps.current.isPositionWall(rightBumper))
      self.x += self.maxMoveSpd;
    if (self.pressingLeft && !Maps.current.isPositionWall(leftBumper))
      self.x -= self.maxMoveSpd;
    if (self.pressingDown && !Maps.current.isPositionWall(downBumper))
      self.y += self.maxMoveSpd;
    if (self.pressingUp && !Maps.current.isPositionWall(upBumper))
      self.y -= self.maxMoveSpd;

    //ispositionvalid

    if (self.x < self.width / 2) self.x = self.width / 2;
    if (self.x > Maps.current.width - self.width / 2)
      self.x = Maps.current.width - self.width / 2;
    if (self.y < self.height / 2) self.y = self.height / 2;
    if (self.y > Maps.current.height - self.height / 2)
      self.y = Maps.current.height - self.height / 2;
  };

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.attackCounter += self.atkSpd;

    if (self.hp <= 0) self.onDeath();
  };
  self.onDeath = function () {};
  self.onDeath2 = function () {};

  self.performAttack = function () {
    if (self.attackCounter > 40) {
      self.attackCounter = 0;
      Bullet.generate(self);
      bulletsound.play();
    }
  };

  self.performEnemyAttack = function () {
    if (self.attackCounter > 50) {
      self.attackCounter = 0;

      BulletEnemy.generate(self);
    }
  };

  self.performGoldEnemyAttack = function () {
    if (self.attackCounter > 50) {
      self.attackCounter = 0;

      GoldBullet.generate(self);
    }
  };

  self.performBossEnemyAttack = function () {
    if (self.attackCounter > 210) {
      self.attackCounter = 0;

      BossBullet.generate(self);
    }
  };

  self.performBossSpecialAttack = function () {
    if (self.attackCounter > 210) {
      self.attackCounter = 0;

      BossBullet.generate(self, self.aimAngle - 30);
      BossBullet.generate(self, self.aimAngle - 60);
      BossBullet.generate(self, self.aimAngle - 90);
      BossBullet.generate(self, self.aimAngle - 120);
      BossBullet.generate(self, self.aimAngle - 150);
      BossBullet.generate(self, self.aimAngle - 180);

      BossBullet.generate(self, self.aimAngle);

      BossBullet.generate(self, self.aimAngle + 30);
      BossBullet.generate(self, self.aimAngle + 60);
      BossBullet.generate(self, self.aimAngle + 90);
      BossBullet.generate(self, self.aimAngle + 120);
      BossBullet.generate(self, self.aimAngle + 150);
    }
  };

  self.performSpecialAttack = function () {
    if (self.attackCounter > 180) {
      self.attackCounter = 0;
      specialbulletsound.play();

      /*for (var i = 0; i < 360; i++) {
        Bullet.generate(self, i);
      }*/

      Bullet.generate(self, self.aimAngle - 30);
      Bullet.generate(self, self.aimAngle - 60);
      Bullet.generate(self, self.aimAngle - 90);
      Bullet.generate(self, self.aimAngle - 120);
      Bullet.generate(self, self.aimAngle - 150);
      Bullet.generate(self, self.aimAngle - 180);

      Bullet.generate(self, self.aimAngle);

      Bullet.generate(self, self.aimAngle + 30);
      Bullet.generate(self, self.aimAngle + 60);
      Bullet.generate(self, self.aimAngle + 90);
      Bullet.generate(self, self.aimAngle + 120);
      Bullet.generate(self, self.aimAngle + 150);
    }
  };

  return self;
};

//##############################

GoldEnemy = function (id, x, y, width, height, img, hp, atkSpd) {
  var self = Actor("goldenemy", id, x, y, width, height, img, hp, atkSpd);
  GoldEnemy.list[id] = self;

  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.spriteAnimCounter += 0.2;
    self.updateAim();
    self.performGoldEnemyAttack();
  };

  ////GoldEnemy gun

  self.updateAim = function () {
    var diffX = player.x - self.x;
    var diffY = player.y - self.y;

    self.aimAngle = (Math.atan2(diffY, diffX) / Math.PI) * 180;
  };

  var super_draw = self.draw;
  self.draw = function () {
    super_draw();
    var x = self.x - player.x + WIDTH / 2;
    var y = self.y - player.y + HEIGHT / 2 - self.height / 2 - 20;

    ctx.save();
    ctx.fillStyle = "red";
    var width = (100 * self.hp) / self.hpMax;
    if (width < 0) width = 0;
    ctx.fillRect(x - 50, y, width, 10);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x - 50, y, 100, 10);

    ctx.restore();
  };

  self.onDeath = function () {
    self.toRemove = true;
    score += 100;
    killgoldengolem += 1;
    bossgolemdiesound.play();
  };
};

GoldEnemy.list = {};

GoldEnemy.update = function () {
  if (frameCount % 15000 === 0)
    //every 60 sec
    GoldEnemy.randomlyGenerate();
  for (var key in GoldEnemy.list) {
    GoldEnemy.list[key].update();
  }
  for (var key in GoldEnemy.list) {
    if (GoldEnemy.list[key].toRemove) delete GoldEnemy.list[key];
  }
};

GoldEnemy.randomlyGenerate = function () {
  GoldEnemy(1, 5350, 5400, 130, 130, Img.goldgolem, 5, 2.5);
  GoldEnemy(2, 2000, 5530, 130, 130, Img.goldgolem, 5, 2.2);
  GoldEnemy(3, 4300, 3750, 130, 130, Img.goldgolem, 5, 2.2);
  GoldEnemy(4, 5880, 2500, 130, 130, Img.goldgolem, 5, 2.3);
  GoldEnemy(5, 2170, 2650, 130, 130, Img.goldgolem, 5, 2);
};
////////////////////////////////////////////////////////////randomly respawn code

/*Enemy.randomlyGenerate = function () {
  //Math.random() returns a number between 0 and 1
  var x = Math.random() * Maps.current.width;
  var y = Math.random() * Maps.current.height;
  var height = 64;
  var width = 64;
  var id = Math.random();
  if (Math.random() < 0.5) GoldEnemy(id, x, y, width, height, Img.golem, 2, 1);
  else GoldEnemy(id, x, y, width, height, Img.goldgolem, 1, 3);
};*/

////////////////////////////////////////////////////////////////////////////////////

EnemyStatic = function (id, x, y, width, height, img, hp, atkSpd, aimAngle) {
  var self = Actor("enemystatic", id, x, y, width, height, img, hp, atkSpd);
  EnemyStatic.list[id] = self;

  self.toRemove = false;

  self.aimAngle = aimAngle;

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.spriteAnimCounter += 0.2;
    self.performEnemyAttack();
  };

  var super_draw = self.draw;
  self.draw = function () {
    super_draw();
    var x = self.x - player.x + WIDTH / 2;
    var y = self.y - player.y + HEIGHT / 2 - self.height / 2 - 20;

    ctx.save();
    ctx.fillStyle = "red";
    var width = (100 * self.hp) / self.hpMax;
    if (width < 0) width = 0;
    ctx.fillRect(x - 50, y, width, 10);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x - 50, y, 100, 10);

    ctx.restore();
  };

  self.onDeath = function () {
    self.toRemove = true;
    score += 50;
    killgolem += 1;
    golemdiesound.play();
  };
};

EnemyStatic.list = {};

EnemyStatic.update = function () {
  if (frameCount % 1500 === 0)
    //every 60 sec
    EnemyStatic.randomlyGenerate();
  for (var key in EnemyStatic.list) {
    EnemyStatic.list[key].update();
  }
  for (var key in EnemyStatic.list) {
    if (EnemyStatic.list[key].toRemove) delete EnemyStatic.list[key];
  }
};

EnemyStatic.staticGenerate = function () {
  EnemyStatic(1, 4160, 6300, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(2, 3700, 6160, 96, 96, Img.golem, 2, 2.6, 0);
  EnemyStatic(3, 4150, 4950, 96, 96, Img.golem, 2, 2, 90);
  EnemyStatic(4, 4320, 6000, 96, 96, Img.golem, 2, 2.3, 90);
  EnemyStatic(5, 5400, 5700, 96, 96, Img.golem, 2, 2, 180);
  EnemyStatic(6, 5550, 5550, 96, 96, Img.golem, 2, 3, 180);
  EnemyStatic(7, 5985, 5250, 96, 96, Img.golem, 2, 1.5, 270);
  EnemyStatic(8, 6595, 5100, 96, 96, Img.golem, 2, 2.4, 180);
  EnemyStatic(9, 6595, 5250, 96, 96, Img.golem, 2, 2.1, 180);
  EnemyStatic(10, 6450, 5850, 96, 96, Img.golem, 2, 2.4, 90);
  EnemyStatic(11, 6150, 6620, 96, 96, Img.golem, 2, 0.7, 180);
  EnemyStatic(12, 5360, 6300, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(13, 5200, 6470, 96, 96, Img.golem, 2, 2.4, 270);
  EnemyStatic(14, 6600, 5700, 96, 96, Img.golem, 2, 0.8, 180);
  EnemyStatic(15, 3700, 5400, 96, 96, Img.golem, 2, 1.5, 180);
  EnemyStatic(16, 3390, 5850, 96, 96, Img.golem, 2, 2.6, 90);
  EnemyStatic(17, 3100, 5550, 96, 96, Img.golem, 2, 2, 90);
  EnemyStatic(18, 2950, 6020, 96, 96, Img.golem, 2, 1.2, 180);
  EnemyStatic(19, 4600, 3120, 96, 96, Img.golem, 2, 1, 270);
  EnemyStatic(20, 1400, 5250, 96, 96, Img.golem, 2, 1.0, 90);
  EnemyStatic(21, 2780, 6620, 96, 96, Img.golem, 2, 1.3, 270);
  EnemyStatic(22, 2180, 6620, 96, 96, Img.golem, 2, 2.2, 270);
  EnemyStatic(23, 1410, 6620, 96, 96, Img.golem, 2, 1.5, 270);
  EnemyStatic(24, 2330, 4340, 96, 96, Img.golem, 2, 1.8, 90);
  EnemyStatic(25, 2180, 4340, 96, 96, Img.golem, 2, 2, 90);
  EnemyStatic(26, 3250, 4340, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(27, 3250, 4200, 96, 96, Img.golem, 2, 1.4, 0);
  EnemyStatic(28, 3110, 4640, 96, 96, Img.golem, 2, 1.6, 90);
  EnemyStatic(29, 3260, 4800, 96, 96, Img.golem, 2, 1.5, 0);
  EnemyStatic(30, 6000, 3430, 96, 96, Img.golem, 2, 1, 180);
  EnemyStatic(31, 6600, 3430, 96, 96, Img.golem, 2, 1.5, 90);
  EnemyStatic(32, 4000, 4800, 96, 96, Img.golem, 2, 2, 270);
  EnemyStatic(33, 3550, 4950, 96, 96, Img.golem, 2, 1.5, 90);
  EnemyStatic(34, 3720, 4950, 96, 96, Img.golem, 2, 2.3, 90);
  EnemyStatic(35, 1580, 3700, 96, 96, Img.golem, 2, 1.3, 180);
  EnemyStatic(36, 1580, 3870, 96, 96, Img.golem, 2, 1.7, 180);
  EnemyStatic(37, 1410, 2485, 96, 96, Img.golem, 2, 0.5, 90);
  EnemyStatic(38, 1725, 3570, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(39, 2320, 3570, 96, 96, Img.golem, 2, 1.2, 180);
  EnemyStatic(40, 2640, 3400, 96, 96, Img.golem, 2, 1.2, 270);
  EnemyStatic(41, 2950, 3600, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(42, 3250, 3550, 96, 96, Img.golem, 2, 1.3, 270);
  EnemyStatic(43, 3855, 3250, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(44, 4000, 3250, 96, 96, Img.golem, 2, 1.1, 90);
  EnemyStatic(45, 4760, 3410, 96, 96, Img.golem, 2, 0.7, 90);
  EnemyStatic(46, 5680, 4010, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(47, 5830, 3850, 96, 96, Img.golem, 2, 0.8, 90);
  EnemyStatic(48, 5230, 4800, 96, 96, Img.golem, 2, 0.8, 180);
  EnemyStatic(49, 6290, 4180, 96, 96, Img.golem, 2, 0.8, 90);
  EnemyStatic(50, 3840, 1600, 96, 96, Img.golem, 2, 1.1, 90);
  EnemyStatic(51, 3840, 2050, 96, 96, Img.golem, 2, 1.2, 90);
  EnemyStatic(52, 4150, 1880, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(53, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(54, 4760, 2340, 96, 96, Img.golem, 2, 0.7, 0);
  EnemyStatic(55, 5230, 2500, 96, 96, Img.golem, 2, 0.8, 180);
  EnemyStatic(56, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(57, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(58, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(59, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(60, 4760, 1900, 96, 96, Img.golem, 2, 1, 0);
  EnemyStatic(61, 5370, 1440, 96, 96, Img.golem, 2, 0.9, 0);
  EnemyStatic(62, 6145, 1750, 96, 96, Img.golem, 2, 0.7, 90);
  EnemyStatic(63, 5985, 1900, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(64, 6590, 2195, 96, 96, Img.golem, 2, 1.2, 90);
  EnemyStatic(65, 2180, 1430, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(66, 2330, 1750, 96, 96, Img.golem, 2, 1.2, 0);
  EnemyStatic(67, 2640, 1900, 96, 96, Img.golem, 2, 1, 90);
  EnemyStatic(68, 3250, 2480, 96, 96, Img.golem, 2, 0.8, 90);
  EnemyStatic(69, 4160, 2810, 96, 96, Img.golem, 2, 0.9, 180);
  EnemyStatic(70, 3100, 1600, 96, 96, Img.golem, 2, 1.2, 90);
  EnemyStatic(71, 2020, 1430, 96, 96, Img.golem, 2, 1.2, 180);
  EnemyStatic(72, 1400, 1905, 96, 96, Img.golem, 2, 1.1, 0);
  EnemyStatic(73, 1400, 2050, 96, 96, Img.golem, 2, 0.7, 0);
  EnemyStatic(74, 1872, 2040, 96, 96, Img.golem, 2, 1.2, 90);
  EnemyStatic(75, 4462, 2956, 96, 96, Img.golem, 2, 0.8, 270);
};

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

BossEnemy = function (id, x, y, width, height, img, hp, atkSpd) {
  var self = Actor("bossenemy", id, x, y, width, height, img, hp, atkSpd);
  BossEnemy.list[id] = self;
  self.maxMoveSpd = 4;

  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.spriteAnimCounter += 0.2;
    self.updateAim();
    self.updateKeyPress();
    self.performBossEnemyAttack();
  };

  self.updateAim = function () {
    var diffX = player.x - self.x;
    var diffY = player.y - self.y;

    self.aimAngle = (Math.atan2(diffY, diffX) / Math.PI) * 180;
  };

  //////walkinn part

  self.updateKeyPress = function () {
    var diffX = player.x - self.x;
    var diffY = player.y - self.y;

    self.pressingRight = diffX > 3;
    self.pressingLeft = diffX < -3;
    self.pressingDown = diffY > 3;
    self.pressingUp = diffY < -3;
  };

  var super_draw = self.draw;
  self.draw = function () {
    super_draw();
    var x = self.x - player.x + WIDTH / 2;
    var y = self.y - player.y + HEIGHT / 2 - self.height / 2 - 20;

    ctx.save();
    ctx.fillStyle = "red";
    var width = (100 * self.hp) / self.hpMax;
    if (width < 0) width = 0;
    ctx.fillRect(x - 50, y, width, 10);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x - 50, y, 100, 10);

    ctx.restore();
  };

  self.onDeath = function () {
    self.toRemove = true;
    score += 1000;
    killboss += 1;
    islandmusic.stop();
    bossmusic.stop();
    bossgolemdiesound.play();
    self.performBossSpecialAttack();

    TheGirl(1, 4000, 400, 50 * 1.1, 70 * 1.1, Img.thegirl, 1);
  };
};

BossEnemy.list = {};

BossEnemy.update = function () {
  if (frameCount % 15000 === 0) BossEnemy.randomlyGenerate();
  for (var key in BossEnemy.list) {
    BossEnemy.list[key].update();
  }
  for (var key in BossEnemy.list) {
    if (BossEnemy.list[key].toRemove) delete BossEnemy.list[key];
  }
};

BossEnemy.randomlyGenerate = function () {};

///////////////////////////////////////////////////////////////////Stone walll appears
///////////////////////////////////////////////////////////////////

Stonewall = function (id, x, y, width, height, img) {
  var self = Actor("stonewall", id, x, y, width, height, img);
  Stonewall.list[id] = self;

  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();
  };
};

Stonewall.list = {};

Stonewall.update = function () {
  for (var key in Stonewall.list) {
    Stonewall.list[key].update();

    var isColliding = player.testCollision(Stonewall.list[key]);
    if (isColliding) {
      player.pressingDown = 0;
    }
  }
  for (var key in Stonewall.list) {
    if (Stonewall.list[key].toRemove) delete Stonewall.list[key];
  }
};

Stonewall.randomlyGenerate = function () {};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

TheGirl = function (id, x, y, width, height, img, hp) {
  var self = Actor("thegirl", id, x, y, width, height, img, hp);
  TheGirl.list[id] = self;

  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.spriteAnimCounter += 0.2;
    self.updateAim();
    self.updateKeyPress();
  };

  self.updateAim = function () {
    var diffX = player.x - self.x;
    var diffY = player.y - self.y;

    self.aimAngle = (Math.atan2(diffY, diffX) / Math.PI) * 180;
  };

  //////walkinn part

  self.updateKeyPress = function () {
    var diffX = player.x - self.x;
    var diffY = player.y - self.y;

    self.pressingRight = diffX > 3;
    self.pressingLeft = diffX < -3;
    self.pressingDown = diffY > 3;
    self.pressingUp = diffY < -3;
  };

  self.onDeath = function () {
    self.toRemove = true;
    score -= 2000;
    islandmusic.stop();
    startNewGame2();
  };
};

TheGirl.update = function () {
  if (frameCount % 15000 === 0) TheGirl.randomlyGenerate();
  for (var key in TheGirl.list) {
    TheGirl.list[key].update();

    var isColliding = player.testCollision(TheGirl.list[key]);
    if (isColliding) {
      playerwin = !playerwin;

      finalmusic.play();
    }
  }

  for (var key in TheGirl.list) {
    if (TheGirl.list[key].toRemove) delete TheGirl.list[key];
  }
};

TheGirl.randomlyGenerate = function () {};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

Upgrade = function (id, x, y, width, height, category, img) {
  var self = Entity("upgrade", id, x, y, width, height, img);

  self.category = category;
  Upgrade.list[id] = self;
};

Upgrade.list = {};

Upgrade.update = function () {
  if (frameCount % 1500 === 0)
    //every 60 sec
    Upgrade.staticGenerate();

  for (var key in Upgrade.list) {
    Upgrade.list[key].update();

    var isColliding = player.testCollision(Upgrade.list[key]);
    if (isColliding) {
      if (Upgrade.list[key].category === "hp" && player.hp != 10)
        (player.hp += 1), drinksound.play();

      if (Upgrade.list[key].category === "maxhp" && player.hp != 10)
        (player.hp = 10), drinksound.play();

      if (Upgrade.list[key].category === "atkSpd")
        (player.atkSpd += 2), drinksound.play();

      if (Upgrade.list[key].category === "speed")
        (player.maxMoveSpd += 3), drinksound.play();

      if (Upgrade.list[key].category === "diamond")
        (score += 300), (collectdiamond += 1), rubysound.play();

      if (Upgrade.list[key].category === "ring")
        (score += 100), (collectring += 1), rubysound.play();

      if (Upgrade.list[key].category === "ruby")
        (score += 200), (collectruby += 1), rubysound.play();

      if (Upgrade.list[key].category === "line")
        BossEnemy(1, 4000, 600, 180, 180, Img.bossgolem, 20, 2.3),
          islandmusic.stop(),
          bossmusic.play(),
          Stonewall(1, 3951, 1360, 32, 32, Img.stone),
          Stonewall(2, 3983, 1360, 32, 32, Img.stone),
          Stonewall(3, 4015, 1360, 32, 32, Img.stone),
          Stonewall(4, 4047, 1360, 34, 32, Img.stone);

      Upgrade(24, 3400, 1150, 36, 36, "hp", Img.upgrade1);
      32;
      Upgrade(25, 4600, 1150, 36, 36, "hp", Img.upgrade1);
      Upgrade(26, 3400, 650, 36, 36, "hp", Img.upgrade1);
      Upgrade(27, 4600, 650, 36, 36, "hp", Img.upgrade1);

      delete Upgrade.list[key];
    }
  }
};

Upgrade.staticGenerate = function () {
  Upgrade(1, 4450, 6620, 36, 36, "hp", Img.upgrade1);
  Upgrade(2, 2180, 4930, 36, 36, "hp", Img.upgrade1);
  Upgrade(3, 4760, 1770, 52, 44, "ring", Img.ring);
  Upgrade(4, 4930, 5570, 36, 36, "hp", Img.upgrade1);
  Upgrade(5, 4160, 5700, 36, 36, "hp", Img.upgrade1);
  Upgrade(6, 2800, 5550, 36, 36, "hp", Img.upgrade1);
  Upgrade(7, 2945, 4750, 45, 45, "atkSpd", Img.upgrade2);
  Upgrade(8, 2645, 6620, 36, 36, "maxhp", Img.upgrade4);
  Upgrade(9, 2200, 4040, 36, 36, "hp", Img.upgrade1);
  Upgrade(10, 3550, 3870, 36, 36, "hp", Img.upgrade1);
  Upgrade(11, 6000, 6470, 36, 36, "hp", Img.upgrade1);
  Upgrade(12, 5380, 4480, 36, 36, "hp", Img.upgrade1);
  Upgrade(13, 5220, 2650, 36, 36, "maxhp", Img.upgrade4);
  Upgrade(14, 5380, 3250, 36, 36, "speed", Img.upgrade3);
  Upgrade(15, 2780, 3250, 36, 36, "speed", Img.upgrade3);
  Upgrade(16, 2780, 2650, 36, 36, "hp", Img.upgrade1);
  Upgrade(17, 4300, 1600, 36, 36, "hp", Img.upgrade1);
  Upgrade(18, 2780, 1450, 36, 36, "hp", Img.upgrade1);
  Upgrade(19, 1720, 1750, 36, 36, "hp", Img.upgrade1);
  Upgrade(20, 6140, 4320, 36, 36, "maxhp", Img.upgrade4);
  Upgrade(21, 4320, 4200, 36, 36, "hp", Img.upgrade1);
  Upgrade(22, 4930, 1450, 36, 36, "speed", Img.upgrade3);

  Upgrade(23, 4000, 1250, 100, 0.1, "line", Img.line);

  Upgrade(28, 6590, 6470, 28, 33, "ruby", Img.ruby);
  Upgrade(30, 6590, 4040, 28, 33, "ruby", Img.ruby);
  Upgrade(31, 5380, 4800, 28, 33, "ruby", Img.ruby);
  Upgrade(32, 4930, 3890, 28, 33, "ruby", Img.ruby);
  Upgrade(33, 6280, 2500, 28, 33, "hp", Img.upgrade1);
  Upgrade(35, 5980, 1600, 52, 44, "diamond", Img.diamond);
  Upgrade(36, 5070, 2650, 52, 44, "ring", Img.ring);
  Upgrade(37, 5520, 2650, 36, 36, "hp", Img.upgrade1);
  Upgrade(38, 6600, 3270, 52, 44, "ring", Img.ring);
  Upgrade(39, 4600, 5250, 52, 44, "ring", Img.ring);
  Upgrade(40, 4610, 6300, 52, 44, "ring", Img.ring);
  Upgrade(41, 6300, 6000, 52, 44, "ring", Img.ring);
  Upgrade(42, 6600, 5540, 52, 44, "ring", Img.ring);
  Upgrade(43, 3250, 5080, 36, 36, "speed", Img.upgrade3);
  Upgrade(44, 3860, 4950, 36, 36, "hp", Img.upgrade1);
  Upgrade(45, 4150, 3270, 52, 44, "ring", Img.ring);
  Upgrade(46, 3550, 4480, 52, 44, "ring", Img.ring);
  Upgrade(47, 2180, 3750, 52, 44, "ring", Img.ring);
  Upgrade(48, 2780, 4490, 28, 33, "ruby", Img.ruby);
  Upgrade(49, 1560, 5400, 52, 44, "diamond", Img.diamond);
  Upgrade(50, 1560, 6620, 52, 44, "ring", Img.ring);
  Upgrade(51, 3850, 6630, 52, 44, "ring", Img.ring);
  Upgrade(52, 1560, 1600, 52, 44, "diamond", Img.diamond);
  Upgrade(53, 2500, 1600, 52, 44, "ring", Img.ring);
  Upgrade(54, 1720, 2810, 36, 36, "maxhp", Img.upgrade4);
  Upgrade(55, 3400, 1600, 52, 44, "ring", Img.ring);
  Upgrade(56, 3400, 2210, 52, 44, "ring", Img.ring);
  Upgrade(57, 2500, 1600, 52, 44, "ring", Img.ring);
  Upgrade(58, 5550, 6470, 52, 44, "ring", Img.ring);
  Upgrade(59, 5550, 6020, 52, 44, "ring", Img.ring);
  Upgrade(60, 1410, 4480, 52, 44, "ring", Img.ring);
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////PLAYER BULLET
/////////////////////////////////////////////////////

Bullet = function (id, x, y, spdX, spdY, width, height, combatType) {
  var self = Entity("bullet", id, x, y, width, height, Img.bullet);

  self.timer = 0;
  self.combatType = combatType;
  self.spdX = spdX;
  self.spdY = spdY;
  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();

    var toRemove = false;
    self.timer++;

    if (self.timer > 60) self.toRemove = true;

    //bullet was shot by player

    if (self.combatType === "player") {
      for (var key2 in EnemyStatic.list) {
        if (self.testCollision(EnemyStatic.list[key2])) {
          self.toRemove = true;
          EnemyStatic.list[key2].hp -= 1;
        }
      }
    }

    if (self.combatType === "player") {
      //bullet was shot by player
      for (var key2 in GoldEnemy.list) {
        if (self.testCollision(GoldEnemy.list[key2])) {
          self.toRemove = true;
          GoldEnemy.list[key2].hp -= 1;
        }
      }
    }

    //bullet was shot by player
    if (self.combatType === "player") {
      for (var key2 in BossEnemy.list) {
        if (self.testCollision(BossEnemy.list[key2])) {
          self.toRemove = true;
          BossEnemy.list[key2].hp -= 1;
        }
      }
    }

    //bullet was shot by player
    if (self.combatType === "player") {
      for (var key2 in TheGirl.list) {
        if (self.testCollision(TheGirl.list[key2])) {
          self.toRemove = true;
          TheGirl.list[key2].hp -= 1;
        }
      }
    }

    //bullet was shot by player
    if (self.combatType === "player") {
      for (var key2 in Stonewall.list) {
        if (self.testCollision(Stonewall.list[key2])) {
          self.toRemove = true;
        }
      }
    }

    if (Maps.current.isPositionWall(self)) {
      self.toRemove = true;
    }
  };

  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;

    if (self.x < 0 || self.x > Maps.current.width) {
      self.spdX = -self.spdX;
    }
    if (self.y < 0 || self.y > Maps.current.height) {
      self.spdY = -self.spdY;
    }
  };

  Bullet.list[id] = self;
};

Bullet.list = {};

Bullet.update = function () {
  for (var key in Bullet.list) {
    var b = Bullet.list[key];

    b.update();

    if (b.toRemove) {
      delete Bullet.list[key];
    }
  }
};

Bullet.generate = function (actor, aimOverwrite) {
  //Math.random() returns a number between 0 and 1
  var x = actor.x;
  var y = actor.y;
  var height = 25;
  var width = 25;
  var id = Math.random();

  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;

  var spdX = Math.cos((angle / 180) * Math.PI) * 25;
  var spdY = Math.sin((angle / 180) * Math.PI) * 25;
  Bullet(id, x, y, spdX, spdY, width, height, actor.type);
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////STONE ENEMY BULLET
/////////////////////////////////////////////////////

BulletEnemy = function (id, x, y, spdX, spdY, width, height, combatType) {
  var self = Entity("bulletenemy", id, x, y, width, height, Img.bulletenemy);

  self.timer = 0;
  self.combatType = combatType;
  self.spdX = spdX;
  self.spdY = spdY;
  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();

    var toRemove = false;
    self.timer++;
    if (self.timer > 90) self.toRemove = true;

    if (self.combatType === "enemystatic") {
      if (self.testCollision(player)) {
        self.toRemove = true;
        player.hp -= 1;
        playerpainsound.play();
      }
    }

    if (Maps.current.isPositionWall(self)) {
      self.toRemove = true;
    }
  };

  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;

    if (self.x < 0 || self.x > Maps.current.width) {
      self.spdX = -self.spdX;
    }
    if (self.y < 0 || self.y > Maps.current.height) {
      self.spdY = -self.spdY;
    }
  };

  BulletEnemy.list[id] = self;
};

BulletEnemy.list = {};

BulletEnemy.update = function () {
  for (var key in BulletEnemy.list) {
    var b = BulletEnemy.list[key];
    b.update();

    if (b.toRemove) {
      delete BulletEnemy.list[key];
    }
  }
};

BulletEnemy.generate = function (actor, aimOverwrite) {
  //Math.random() returns a number between 0 and 1
  var x = actor.x;
  var y = actor.y;
  var height = 50;
  var width = 50;
  var id = Math.random();

  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;

  var spdX = Math.cos((angle / 180) * Math.PI) * 20;
  var spdY = Math.sin((angle / 180) * Math.PI) * 20;
  BulletEnemy(id, x, y, spdX, spdY, width, height, actor.type);
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////GOLD ENEMY BULLET
/////////////////////////////////////////////////////

GoldBullet = function (id, x, y, spdX, spdY, width, height, combatType) {
  var self = Entity("goldbullet", id, x, y, width, height, Img.goldbullet);

  self.timer = 0;
  self.combatType = combatType;
  self.spdX = spdX;
  self.spdY = spdY;
  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();

    var toRemove = false;
    self.timer++;
    if (self.timer > 50) self.toRemove = true;

    if (self.combatType === "goldenemy") {
      if (self.testCollision(player)) {
        self.toRemove = true;
        player.hp -= 2;
      }
    }

    if (Maps.current.isPositionWall(self)) {
      self.toRemove = true;
    }
  };

  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;

    if (self.x < 0 || self.x > Maps.current.width) {
      self.spdX = -self.spdX;
    }
    if (self.y < 0 || self.y > Maps.current.height) {
      self.spdY = -self.spdY;
    }
  };

  GoldBullet.list[id] = self;
};

GoldBullet.list = {};

GoldBullet.update = function () {
  for (var key in GoldBullet.list) {
    var b = GoldBullet.list[key];
    b.update();

    if (b.toRemove) {
      delete GoldBullet.list[key];
    }
  }
};

GoldBullet.generate = function (actor, aimOverwrite) {
  //Math.random() returns a number between 0 and 1
  var x = actor.x;
  var y = actor.y;
  var height = 50;
  var width = 50;
  var id = Math.random();

  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;

  var spdX = Math.cos((angle / 180) * Math.PI) * 20;
  var spdY = Math.sin((angle / 180) * Math.PI) * 20;
  GoldBullet(id, x, y, spdX, spdY, width, height, actor.type);
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////BOSS BULLET
/////////////////////////////////////////////////////

BossBullet = function (id, x, y, spdX, spdY, width, height, combatType) {
  var self = Entity("bossbullet", id, x, y, width, height, Img.bossbullet);

  self.timer = 0;
  self.combatType = combatType;
  self.spdX = spdX;
  self.spdY = spdY;
  self.toRemove = false;

  var super_update = self.update;
  self.update = function () {
    super_update();

    var toRemove = false;
    self.timer++;
    if (self.timer > 50) self.toRemove = true;

    if (self.combatType === "bossenemy") {
      if (self.testCollision(player)) {
        self.toRemove = true;
        player.hp -= 2.5;
        if (player.hp <= 0) player.onDeath2();
      }
    }

    if (self.combatType === "bossenemy") {
      for (var key2 in TheGirl.list) {
        if (self.testCollision(TheGirl.list[key2])) {
          toRemove = true;
          TheGirl.list[key2].hp -= 1;
        }
      }
    }

    if (Maps.current.isPositionWall(self)) {
      self.toRemove = true;
    }
  };

  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;

    if (self.x < 0 || self.x > Maps.current.width) {
      self.spdX = -self.spdX;
    }
    if (self.y < 0 || self.y > Maps.current.height) {
      self.spdY = -self.spdY;
    }
  };

  BossBullet.list[id] = self;
};

BossBullet.list = {};

BossBullet.update = function () {
  for (var key in BossBullet.list) {
    var b = BossBullet.list[key];
    b.update();

    if (b.toRemove) {
      delete BossBullet.list[key];
    }
  }
};

BossBullet.generate = function (actor, aimOverwrite) {
  //Math.random() returns a number between 0 and 1
  var x = actor.x;
  var y = actor.y;
  var height = 60;
  var width = 60;
  var id = Math.random();

  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;

  var spdX = Math.cos((angle / 180) * Math.PI) * 20;
  var spdY = Math.sin((angle / 180) * Math.PI) * 20;
  BossBullet(id, x, y, spdX, spdY, width, height, actor.type);
};
