
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
    this.state = 'main' // 'main' | 'levels' | 'levelDetail'
  }

  create() {
    const { width, height } = this.scale
    const dpr = window.devicePixelRatio || 1
    const font = 'Orbitron, Courier New'

    // Background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x0d0d1a, 0x0d0d1a, 1)
    bg.fillRect(0, 0, width, height)

    for (let x = 0; x < width; x += 40) {
      const line = this.add.graphics()
      line.lineStyle(1, 0x1a1a3e, 0.3)
      line.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y < height; y += 40) {
      const line = this.add.graphics()
      line.lineStyle(1, 0x1a1a3e, 0.3)
      line.lineBetween(0, y, width, y)
    }

    // ── TITLE ──────────────────────────────────────────────
    this.add.text(width / 2, height / 2 - 250, 'LABERINTO', {
      fontSize: '112px',
      fontFamily: font,
      fontStyle: 'bold',
      color: '#00ff88',
      stroke: '#003322',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 24, fill: true },
      resolution: dpr,
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 135, 'INFERNAL', {
      fontSize: '72px',
      fontFamily: font,
      fontStyle: 'bold',
      color: '#ff4444',
      stroke: '#3a0000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff2200', blur: 20, fill: true },
      resolution: dpr,
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 62, 'Encontrá la llave y luego la salida en medio del terror', {
      fontSize: '18px',
      fontFamily: font,
      color: '#ffffff',
      resolution: dpr,
    }).setOrigin(0.5)

    // ── SEPARATOR ──────────────────────────────────────────
    const sep = this.add.graphics()
    sep.lineStyle(1, 0x334455, 0.8)
    sep.lineBetween(width / 2 - 200, height / 2 - 36, width / 2 + 200, height / 2 - 36)

    // ── CONTROLS (always visible) ───────────────────────────
    const controls = [
      { key: 'Flechas',  action: 'Moverse' },
      { key: 'Space',    action: 'Pausa' },
      { key: 'Enter',    action: 'Seleccionar arma' },
      { key: 'Z',        action: 'Disparar / Atacar' },
      { key: 'Esc',      action: 'Salir' },
    ]

    const ctrlY = height / 2 - 18
    controls.forEach(({ key, action }, i) => {
      const y = ctrlY + i * 28

      this.add.text(width / 2 - 20, y, key, {
        fontSize: '17px',
        fontFamily: font,
        fontStyle: 'bold',
        color: '#00cc66',
        resolution: dpr,
      }).setOrigin(1, 0.5)

      this.add.text(width / 2 - 10, y, ':', {
        fontSize: '17px',
        fontFamily: font,
        color: '#ffffff',
        resolution: dpr,
      }).setOrigin(0.5, 0.5)

      this.add.text(width / 2, y, action, {
        fontSize: '17px',
        fontFamily: font,
        color: '#ffffff',
        resolution: dpr,
      }).setOrigin(0, 0.5)
    })

    const sep2 = this.add.graphics()
    sep2.lineStyle(1, 0x334455, 0.8)
    sep2.lineBetween(width / 2 - 200, height / 2 + 128, width / 2 + 200, height / 2 + 128)

    // ── MAIN STATE ─────────────────────────────────────────
    this.mainGroup = this.add.group()

    const startBtn = this.add.text(width / 2, height / 2 + 160, '▶  INICIAR JUEGO', {
      fontSize: '30px',
      fontFamily: font,
      fontStyle: 'bold',
      color: '#00ff88',
      stroke: '#003322',
      strokeThickness: 4,
      resolution: dpr,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.mainGroup.add(startBtn)

    this.tweens.add({
      targets: startBtn,
      alpha: 0.25,
      duration: 750,
      yoyo: true,
      repeat: -1,
    })

    // ── LEVEL SELECT STATE ──────────────────────────────────
    this.levelGroup = this.add.group()

    const cx = width / 2
    const by = height / 2 + 138

    const levelHeader = this.add.text(cx, by, 'SELECCIONAR NIVEL', {
      fontSize: '20px', fontFamily: font, color: '#ffffff', resolution: dpr,
    }).setOrigin(0.5)

    // Caja principal
    const boxH = 72
    const levelBox = this.add.graphics()
    levelBox.lineStyle(2, 0x00ff88, 0.8)
    levelBox.strokeRoundedRect(cx - 240, by + 20, 480, boxH, 10)
    levelBox.fillStyle(0x00ff88, 0.06)
    levelBox.fillRoundedRect(cx - 240, by + 20, 480, boxH, 10)

    // Nombre del nivel
    const chapterTitle = this.add.text(cx, by + 56, 'Nivel 1: Amenaza Radioactiva', {
      fontSize: '18px', fontFamily: font, fontStyle: 'bold',
      color: '#00ff88',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 8, fill: true },
      resolution: dpr,
    }).setOrigin(0.5)

    // Zona clickeable sobre la caja del nivel
    const onLevelClick = () => {
      this._btnSound?.play()
      this.state = 'levelDetail'
      this.setGroupVisible(this.levelGroup, false)
      this.setGroupVisible(this.levelDetailGroup, true)
    }

    const levelHitbox = this.add.zone(cx, by + 56, 480, boxH)
      .setInteractive({ useHandCursor: true })
    levelHitbox.on('pointerdown', onLevelClick)

    chapterTitle.setInteractive({ useHandCursor: true })
    chapterTitle.on('pointerdown', onLevelClick)

    const levelHint = this.add.text(cx, by + 118, 'ESC para volver', {
      fontSize: '13px', fontFamily: font, color: '#556666', resolution: dpr,
    }).setOrigin(0.5)

    this.levelGroup.add(levelHeader)
    this.levelGroup.add(levelBox)
    this.levelGroup.add(chapterTitle)
    this.levelGroup.add(levelHitbox)
    this.levelGroup.add(levelHint)

    this.setGroupVisible(this.levelGroup, false)

    // ── LEVEL DETAIL STATE ─────────────────────────────────
    this.levelDetailGroup = this.add.group()

    // Fondo completo que cubre el menú principal
    const detailBg = this.add.graphics()
    detailBg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x0d0d1a, 0x0d0d1a, 1)
    detailBg.fillRect(0, 0, width, height)
    for (let xd = 0; xd < width; xd += 40) {
      detailBg.lineStyle(1, 0x1a1a3e, 0.3)
      detailBg.lineBetween(xd, 0, xd, height)
    }
    for (let yd = 0; yd < height; yd += 40) {
      detailBg.lineStyle(1, 0x1a1a3e, 0.3)
      detailBg.lineBetween(0, yd, width, yd)
    }
    this.levelDetailGroup.add(detailBg)

    // Título del capítulo
    this.levelDetailGroup.add(
      this.add.text(cx, height * 0.13, 'Capítulo 1: Amenaza Radioactiva', {
        fontSize: '22px', fontFamily: font, fontStyle: 'bold',
        color: '#00ff88',
        shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 10, fill: true },
        resolution: dpr,
      }).setOrigin(0.5)
    )

    const dsep1 = this.add.graphics()
    dsep1.lineStyle(1, 0x335544, 0.8)
    dsep1.lineBetween(cx - 280, height * 0.19, cx + 280, height * 0.19)
    this.levelDetailGroup.add(dsep1)

    const detailMonsters = [
      { key: 'monster',   name: 'Mutantes',       vida: 25,  dano: 2.5, cantidad: 50 },
      { key: 'serpiente', name: 'Mega Serpientes', vida: 50,  dano: 5,   cantidad: 25 },
      { key: 'arania',    name: 'Arañas Kaiju',    vida: 100, dano: 10,  cantidad: 5  },
    ]

    // Columnas de monstruos
    const cols = [cx - 200, cx, cx + 200]

    // Iconos: escala proporcional con bounding box 160×120
    detailMonsters.forEach(({ key }, i) => {
      const img = this.add.image(cols[i], height * 0.35, key).setAlpha(0.95)
      const scale = Math.min(240 / img.width, 180 / img.height)
      img.setScale(scale)
      this.levelDetailGroup.add(img)
    })

    // Nombres
    detailMonsters.forEach(({ name }, i) => {
      this.levelDetailGroup.add(
        this.add.text(cols[i], height * 0.50, name, {
          fontSize: '16px', fontFamily: font, fontStyle: 'bold',
          color: '#00cc88', resolution: dpr,
        }).setOrigin(0.5)
      )
    })

    const dsep2 = this.add.graphics()
    dsep2.lineStyle(1, 0x335544, 0.8)
    dsep2.lineBetween(cx - 280, height * 0.56, cx + 280, height * 0.56)
    this.levelDetailGroup.add(dsep2)

    // Filas de stats — etiqueta alineada a la derecha antes de la primera columna
    const statRows = [
      { label: 'Puntos de vida',      statKey: 'vida'     },
      { label: 'Puntos de daño',      statKey: 'dano'     },
      { label: 'Cantidad en el mapa', statKey: 'cantidad' },
    ]
    const statYs = [height * 0.64, height * 0.71, height * 0.78]

    statRows.forEach(({ label, statKey }, ri) => {
      const y = statYs[ri]

      // Etiqueta right-aligned antes de la primera columna de valores
      this.levelDetailGroup.add(
        this.add.text(cx - 220, y, label + ':', {
          fontSize: '16px', fontFamily: font, color: '#88aaaa', resolution: dpr,
        }).setOrigin(1, 0.5)
      )

      detailMonsters.forEach((m, i) => {
        this.levelDetailGroup.add(
          this.add.text(cols[i], y, String(m[statKey]), {
            fontSize: '18px', fontFamily: font, fontStyle: 'bold',
            color: '#ffffff', resolution: dpr,
          }).setOrigin(0.5)
        )
      })
    })

    const dsep3 = this.add.graphics()
    dsep3.lineStyle(1, 0x335544, 0.8)
    dsep3.lineBetween(cx - 280, height * 0.84, cx + 280, height * 0.84)
    this.levelDetailGroup.add(dsep3)

    const detailPlay = this.add.text(cx, height * 0.91, '▶   JUGAR', {
      fontSize: '26px', fontFamily: font, fontStyle: 'bold',
      color: '#00ff88',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 10, fill: true },
      resolution: dpr,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    detailPlay.on('pointerdown', () => { this._btnSound?.play(); this.startGame() })
    this.levelDetailGroup.add(detailPlay)

    this.tweens.add({
      targets: detailPlay, alpha: 0.4, duration: 600, yoyo: true, repeat: -1,
    })

    this.setGroupVisible(this.levelDetailGroup, false)

    // ── INPUT ───────────────────────────────────────────────
    this.input.keyboard.on('keydown-ENTER', () => this.handleEnter())
    this.input.keyboard.on('keydown-SPACE', () => this.handleEnter())
    this.input.keyboard.on('keydown-ESC', () => this.handleEsc())
    startBtn.on('pointerdown', () => this.handleEnter())

    // ── Música de menú ─────────────────────────────────────────
    if (this.cache.audio.exists('musica_menu')) {
      this._menuMusic = this.sound.add('musica_menu', { loop: true, volume: 0.5 })
      this._menuMusic.play()
    }
    this._btnSound = this.cache.audio.exists('musica_boton_menu')
      ? this.sound.add('musica_boton_menu', { volume: 0.8 })
      : null
    this.events.once('shutdown', () => {
      if (this._menuMusic) { this._menuMusic.stop(); this._menuMusic.destroy(); this._menuMusic = null }
    })

    this.cameras.main.fadeIn(600)
  }

  setGroupVisible(group, visible) {
    group.getChildren().forEach(obj => obj.setVisible(visible))
  }

  handleEnter() {
    this._btnSound?.play()
    if (this.state === 'main') {
      this.state = 'levels'
      this.setGroupVisible(this.mainGroup, false)
      this.setGroupVisible(this.levelGroup, true)
    } else if (this.state === 'levels') {
      this.state = 'levelDetail'
      this.setGroupVisible(this.levelGroup, false)
      this.setGroupVisible(this.levelDetailGroup, true)
    } else if (this.state === 'levelDetail') {
      this.startGame()
    }
  }

  handleEsc() {
    if (this.state === 'levelDetail') {
      this.state = 'levels'
      this.setGroupVisible(this.levelDetailGroup, false)
      this.setGroupVisible(this.levelGroup, true)
    } else if (this.state === 'levels') {
      this.state = 'main'
      this.setGroupVisible(this.levelGroup, false)
      this.setGroupVisible(this.mainGroup, true)
    }
  }

  startGame() {
    this.input.keyboard.removeAllListeners()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level: 1 })
    })
  }
}
