'use strict';

const ENEMY_DIRECTION_RIGHT = 1;
const ENEMY_DIRECTION_LEFT = -1;

const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
  preload,
  create,
  update,
});

let player, platforms, diamonds, scoreText, gameStatus, gameStatus2, cursors, enemy;
let score = 0;
let enemyStats = {
  moveSpeed: 300,
  direction: ENEMY_DIRECTION_LEFT,
};

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('diamond', 'assets/diamond.png');
  game.load.spritesheet('woof', 'assets/woof.png', 32, 32);
  game.load.spritesheet('badWoof', 'assets/bad_woof.png', 32, 32);

}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'sky');

  platforms = game.add.group();
  platforms.enableBody = true;

  let ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2,2);
  ground.body.immovable = true;

  let ledge = platforms.create(400, 450, 'ground');
  ledge.body.immovable = true;

  ledge = platforms.create(-75, 350, 'ground');
  ledge.body.immovable = true;

  player = game.add.sprite(32, game.world.height - 150, 'woof');
  game.physics.arcade.enable(player);
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 800;
  player.body.collideWorldBounds = true;
  player.animations.add('left', [0, 1], 10, true);
  player.animations.add('right', [2, 3], 10, true);

  enemy = game.add.sprite(game.world.width - 64, 200, 'badWoof');
  game.physics.arcade.enable(enemy);
  enemy.body.bounce.y = 0.2;
  enemy.body.gravity.y = 800;
  enemy.body.collideWorldBounds = true;
  enemy.animations.add('left', [0, 1], 10, true);
  enemy.animations.add('right', [2, 3], 10, true);

  window.en = enemy;

  diamonds = game.add.group();
  diamonds.enableBody = true;

  for (let i = 0; i < 12; i++) {
    const diamond = diamonds.create(i * 70, 0, 'diamond');

    diamond.body.gravity.y = 1000;
    diamond.body.bounce.y = 0.3 + Math.random() * 0.2;
  }

  gameStatus = game.add.text(game.world.width / 3, game.world.height / 3, '', { fontSze: '80px', fill: '#0A0' })
  gameStatus2 = game.add.text((game.world.width / 3) - 5, (game.world.height / 3) - 5, '', { fontSze: '80px', fill: '#A00' })
  scoreText = game.add.text(16, 16, '', { fontSze: '32px', fill: '#000' });
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);
  game.physics.arcade.collide(diamonds, platforms);
  game.physics.arcade.collide(enemy, platforms);
  game.physics.arcade.overlap(player, enemy, enemyCollide, null, this);

  player.body.velocity.x = 0;

  moveEnemy();

  if (cursors.left.isDown) {
    player.body.velocity.x = -250;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 250;
    player.animations.play('right');
  } else {
    player.animations.stop();
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -450;
  }

  if (score === 120) {
    enemy.kill();
    score = 0;
    gameStatus.text = 'YOU WIN!';
    gameStatus2.text = 'YOU WIN!';
  }
}

function collectDiamond(player, diamond) {
  diamond.kill();

  score += 10;
  scoreText.text = 'Score: ' + score;
}

function moveEnemy() {
  if (enemy.worldPosition.x <= 0) {
    enemyStats.direction = ENEMY_DIRECTION_RIGHT;
    enemy.animations.play('right');
  }

  if (enemy.worldPosition.x + enemy.width >= game.world.width) {

    enemyStats.direction = ENEMY_DIRECTION_LEFT;
    enemy.animations.play('left');
  }

  if (Math.random() >= 0.95 && enemy.body.touching.down) {
    enemy.body.velocity.y = -500;
  }

  enemy.body.velocity.x = enemyStats.moveSpeed * enemyStats.direction;
}

function enemyCollide() {
  player.kill();
  gameStatus.text = 'YOU DEAD!';
  gameStatus2.text = 'YOU DEAD!';
}
