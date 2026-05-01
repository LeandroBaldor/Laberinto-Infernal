import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { UIScene } from './scenes/UIScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0d1a04',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene],
}

new Phaser.Game(config)