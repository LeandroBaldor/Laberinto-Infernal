export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComingSoonScene' })
  }

  create() {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#000000')

    // Título verde neón con efecto de parpadeo
    const title = this.add.text(width / 2, height / 2 - 60, 'Próximamente nuevos niveles', {
      fontFamily: 'monospace',
      fontSize: Math.floor(width * 0.042) + 'px',
      color: '#00ff00',
      stroke: '#00ff00',
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff00', blur: 18, fill: true },
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5)

    // Parpadeo neón en el título
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.75 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Botón rojo neón
    const btn = this.add.text(width / 2, height / 2 + 60, 'Volver al menú', {
      fontFamily: 'monospace',
      fontSize: Math.floor(width * 0.028) + 'px',
      color: '#ff0033',
      stroke: '#ff0033',
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0033', blur: 18, fill: true },
      backgroundColor: '#1a0008',
      padding: { x: 24, y: 12 },
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setStyle({
      color: '#ffffff', stroke: '#ff0033', strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0033', blur: 28, fill: true },
      backgroundColor: '#3a0010',
    }))
    btn.on('pointerout', () => btn.setStyle({
      color: '#ff0033', stroke: '#ff0033', strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0033', blur: 18, fill: true },
      backgroundColor: '#1a0008',
    }))
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene')
      })
    })

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }
}
