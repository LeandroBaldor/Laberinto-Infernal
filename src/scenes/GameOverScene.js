import { gameOverSound } from '../utils/SoundEngine.js'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data) {
    this.finalScore = data.score || 0
    this.level = data.level || 1
  }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x0a0a0f).setOrigin(0, 0)

    for (let i = 0; i < 8; i++) {
      const x = 50 + Math.random() * (width - 100)
      const h = 40 + Math.random() * 120
      this.add.rectangle(x, 0, 3 + Math.random() * 4, h, 0xaa0000, 0.6).setOrigin(0.5, 0)
    }

    this.add.text(width / 2, height / 2 - 130, 'YOU DIED', {
      fontSize: '72px',
      fontFamily: 'Courier New',
      color: '#cc0000',
      stroke: '#330000',
      strokeThickness: 8,
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 40, `Reached Level ${this.level}`, {
      fontSize: '22px',
      fontFamily: 'Courier New',
      color: '#888899',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 10, `Final Score: ${this.finalScore}`, {
      fontSize: '28px',
      fontFamily: 'Courier New',
      color: '#ffdd00',
    }).setOrigin(0.5)

    const restartBtn = this.add.text(width / 2, height / 2 + 100, '[ ENTER to Restart ]', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#00ff88',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 140, '[ M for Menu ]', {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#5566aa',
    }).setOrigin(0.5)

    this.tweens.add({
      targets: restartBtn,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    this.input.keyboard.once('keydown-ENTER', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { level: 1, score: 0 })
      })
    })

    this.input.keyboard.once('keydown-M', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene')
      })
    })

    this.cameras.main.fadeIn(600)
    gameOverSound()
  }
}