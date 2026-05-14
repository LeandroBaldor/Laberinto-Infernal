import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { SplashScene } from './scenes/SplashScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { UIScene } from './scenes/UIScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'
import { ComingSoonScene } from './scenes/ComingSoonScene.js'

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0d1a04',
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
  scene: [BootScene, SplashScene, MenuScene, GameScene, UIScene, GameOverScene, ComingSoonScene],
}

new Phaser.Game(config)