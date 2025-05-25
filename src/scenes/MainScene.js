import Phaser from 'phaser'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/level.json')
    this.load.image('tiles', 'assets/tilemap_packed.png')
    this.load.image('player', 'assets/player.png')
    this.load.audio('jump', 'assets/jump.wav')
    this.load.audio('collect', 'assets/collect.wav')
    this.load.multiatlas('kenny-particles', 'assets/kenny-particles.json', 'assets')
  }

  create() {
    const map = this.make.tilemap({ key: 'map' })
    const tileset = map.addTilesetImage('kenny_tilemap_packed', 'tiles')
    const ground = map.createLayer('Ground', tileset, 0, 0)

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    ground.setCollisionByProperty({ collides: true })

    // Player
    this.player = this.physics.add.sprite(100, 300, 'player')
    this.player.setScale(0.1)
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, ground)

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.25, 0.25)
    this.cameras.main.setDeadzone(50, 50)
    this.cameras.main.setZoom(1.5)

    // Input
    this.cursors = this.input.keyboard.createCursorKeys()
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)

    // Sounds
    this.jumpSound = this.sound.add('jump')
    this.collectSound = this.sound.add('collect')

    // Horizontal particle effect (movement smoke)
    this.walkingParticles = this.add.particles(0, 0, 'kenny-particles', {
      frame: ['smoke_03.png', 'smoke_09.png'],
      scale: { start: 0.03, end: 0.1 },
      lifespan: 350,
      alpha: { start: 1, end: 0.1 }
    })
    this.walkingParticles.stop()

    // Vertical jump particle
    this.jumpParticles = this.add.particles(0, 0, 'kenny-particles', {
      frame: ['muzzle_01.png'],
      speedY: { min: -100, max: -200 },
      lifespan: 300,
      scale: { start: 0.1, end: 0 },
      alpha: { start: 1, end: 0.1 },
      quantity: 6,
      on: false
    })

    // Collectibles
    this.coins = map.createFromObjects("Objects", {
      name: "coin",
      key: "tiles",
      frame: 151
    })
    this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY)
    this.coinGroup = this.add.group(this.coins)
    this.physics.add.overlap(this.player, this.coinGroup, (player, coin) => {
      coin.destroy()
      this.collectSound.play()
    })

    // Goal (Level Complete)
    const goalObj = map.createFromObjects("Objects", {
      name: "goal",
      key: "tiles",
      frame: 152
    })
    this.physics.world.enable(goalObj, Phaser.Physics.Arcade.STATIC_BODY)
    this.goal = goalObj
    this.physics.add.overlap(this.player, this.goal, () => {
      this.add.text(this.player.x - 30, this.player.y - 40, 'LEVEL COMPLETE!', {
        fontSize: '16px',
        fill: '#fff',
        backgroundColor: '#000'
      })
      this.scene.pause()
    })
  }

  update() {
    if (!this.cursors) return

    const onGround = this.player.body.blocked.down

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
      this.walkingParticles.startFollow(this.player, this.player.displayWidth / 2 - 10, this.player.displayHeight / 2 - 5)
      this.walkingParticles.setParticleSpeed(60, 0)
      if (onGround) this.walkingParticles.start()
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
      this.walkingParticles.startFollow(this.player, -this.player.displayWidth / 2 + 10, this.player.displayHeight / 2 - 5)
      this.walkingParticles.setParticleSpeed(-60, 0)
      if (onGround) this.walkingParticles.start()
    } else {
      this.player.setVelocityX(0)
      this.walkingParticles.stop()
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-330)
      this.jumpSound.play()
      this.jumpParticles.emitParticleAt(this.player.x, this.player.y + 16)
    }

    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart()
    }
  }
}
