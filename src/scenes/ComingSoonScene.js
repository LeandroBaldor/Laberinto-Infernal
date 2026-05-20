export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComingSoonScene' })
  }

  create() {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#000000')

    this.add.text(width / 2, height / 2 - 60, 'Próximamente nuevos niveles', {
      fontFamily: 'monospace',
      fontSize: Math.floor(width * 0.042) + 'px',
      color: '#ff0000',
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5)

    const btn = this.add.text(width / 2, height / 2 + 60, 'Volver al menú', {
      fontFamily: 'monospace',
      fontSize: Math.floor(width * 0.028) + 'px',
      color: '#ff0000',
      backgroundColor: '#330000',
      padding: { x: 24, y: 12 },
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setStyle({ color: '#ffffff', backgroundColor: '#660000' }))
    btn.on('pointerout',  () => btn.setStyle({ color: '#ff0000', backgroundColor: '#330000' }))
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene')
      })
    })

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }
}
