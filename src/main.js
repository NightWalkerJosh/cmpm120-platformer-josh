import Phaser from 'phaser'
import MainScene from './scenes/MainScene'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1d212d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: true
    }
  },
  scene: [MainScene]
}

new Phaser.Game(config)
