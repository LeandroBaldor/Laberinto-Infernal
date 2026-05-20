export class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' })
  }

  create() {
    const { width, height } = this.scale
    const font = 'Orbitron, Courier New'

    const bg = this.add.graphics()
    bg.fillStyle(0x0a0a0f)
    bg.fillRect(0, 0, width, height)

    this.add.text(width / 2, height / 2 - 60, 'LABERINTO', {
      fontSize: '80px', fontFamily: font, fontStyle: 'bold',
      color: '#00ff88', stroke: '#003322', strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 20, fill: true },
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 10, 'INFERNAL', {
      fontSize: '52px', fontFamily: font, fontStyle: 'bold',
      color: '#ff4444', stroke: '#3a0000', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff2200', blur: 16, fill: true },
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 62, 'By Yeyo', {
      fontSize: '20px', fontFamily: "'Press Start 2P', Courier New",
      color: '#cc33ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#cc33ff', blur: 16, fill: true },
    }).setOrigin(0.5)

    const prompt = this.add.text(width / 2, height / 2 + 116, 'PRESIONÁ CUALQUIER TECLA', {
      fontSize: '20px', fontFamily: font, color: '#ffffff',
    }).setOrigin(0.5)

    this.tweens.add({ targets: prompt, alpha: 0.1, duration: 600, yoyo: true, repeat: -1 })

    const goToMenu = () => {
      this.input.keyboard.removeAllListeners()
      this.input.removeAllListeners()
      this.scene.start('MenuScene')
    }

    this.input.once('pointerdown', goToMenu)
    this.input.keyboard.once('keydown', goToMenu)
  }
}
