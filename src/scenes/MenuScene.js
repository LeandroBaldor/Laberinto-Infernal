
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

    // ── LEVEL SELECT STATE — dropdown ───────────────────────
    this.levelGroup = this.add.group()
    this.selectedLevel = 1
    this._dropdownOpen = false

    const cx = width / 2
    const by = height / 2 + 138
    const ddW = 400
    const headerH = 44
    const itemH = 42

    const levels = [
      { label: 'Nivel 1: Amenaza Radioactiva',        num: 1, color: 0x00ff88 },
      { label: 'Nivel 2: La Rebelión de las Máquinas', num: 2, color: 0x00ff88 },
    ]

    // ── Fondo del dropdown (crece cuando está abierto)
    const ddBg = this.add.graphics()
    const ddItems = []
    this._ddItems = ddItems

    const drawDropdown = (open) => {
      ddBg.clear()
      // Header
      ddBg.fillStyle(0x0d1f14, 0.95)
      ddBg.fillRoundedRect(cx - ddW / 2, by, ddW, headerH, open ? { tl: 8, tr: 8, bl: 0, br: 0 } : 8)
      ddBg.lineStyle(2, 0x00ff88, 0.9)
      ddBg.strokeRoundedRect(cx - ddW / 2, by, ddW, headerH, open ? { tl: 8, tr: 8, bl: 0, br: 0 } : 8)

      if (open) {
        // Items background
        ddBg.fillStyle(0x071210, 0.97)
        ddBg.fillRoundedRect(cx - ddW / 2, by + headerH, ddW, itemH * levels.length, { tl: 0, tr: 0, bl: 8, br: 8 })
        ddBg.lineStyle(2, 0x00ff88, 0.5)
        ddBg.strokeRoundedRect(cx - ddW / 2, by + headerH, ddW, itemH * levels.length, { tl: 0, tr: 0, bl: 8, br: 8 })
        // Divider at top of items
        ddBg.lineStyle(1, 0x00ff88, 0.3)
        ddBg.lineBetween(cx - ddW / 2 + 8, by + headerH, cx + ddW / 2 - 8, by + headerH)
      }
    }

    // ── Header label + arrow
    const headerLabel = this.add.text(cx - 10, by + headerH / 2, 'SELECCIONAR NIVEL', {
      fontSize: '17px', fontFamily: font, fontStyle: 'bold', color: '#00ff88', resolution: dpr,
    }).setOrigin(0.5)

    const arrowText = this.add.text(cx + ddW / 2 - 24, by + headerH / 2, '▼', {
      fontSize: '14px', fontFamily: font, color: '#00ff88', resolution: dpr,
    }).setOrigin(0.5)
    this._arrowText = arrowText
    this._drawDropdown = drawDropdown

    const headerZone = this.add.zone(cx, by + headerH / 2, ddW, headerH).setInteractive({ useHandCursor: true })
    headerZone.on('pointerdown', () => {
      this._btnSound?.play()
      this._dropdownOpen = !this._dropdownOpen
      drawDropdown(this._dropdownOpen)
      arrowText.setText(this._dropdownOpen ? '▲' : '▼')
      ddItems.forEach(({ obj }) => obj.forEach(o => o.setVisible(this._dropdownOpen)))
    })

    // ── Items (ocultos inicialmente)
    levels.forEach(({ label, num, color }, i) => {
      const iy = by + headerH + i * itemH

      const itemHover = this.add.graphics()
      const drawHover = (on) => {
        itemHover.clear()
        if (on) {
          itemHover.fillStyle(color, 0.12)
          itemHover.fillRect(cx - ddW / 2 + 2, iy + 2, ddW - 4, itemH - 4)
        }
        if (i < levels.length - 1) {
          itemHover.lineStyle(1, 0x00ff88, 0.15)
          itemHover.lineBetween(cx - ddW / 2 + 12, iy + itemH, cx + ddW / 2 - 12, iy + itemH)
        }
      }
      drawHover(false)

      const bullet = this.add.text(cx - ddW / 2 + 20, iy + itemH / 2, '›', {
        fontSize: '20px', fontFamily: font, color: '#' + color.toString(16).padStart(6, '0'), resolution: dpr,
      }).setOrigin(0, 0.5)

      const itemLabel = this.add.text(cx - ddW / 2 + 42, iy + itemH / 2, label, {
        fontSize: '16px', fontFamily: font, fontStyle: 'bold',
        color: '#' + color.toString(16).padStart(6, '0'), resolution: dpr,
      }).setOrigin(0, 0.5)

      const itemZone = this.add.zone(cx, iy + itemH / 2, ddW, itemH).setInteractive({ useHandCursor: true })
      itemZone.on('pointerover', () => drawHover(true))
      itemZone.on('pointerout',  () => drawHover(false))
      itemZone.on('pointerdown', () => {
        this._btnSound?.play()
        this.selectedLevel = num
        this.state = 'levelDetail'
        this._dropdownOpen = false
        this.setGroupVisible(this.levelGroup, false)
        if (num === 1) this.setGroupVisible(this.levelDetailGroup, true)
        else           this.setGroupVisible(this.levelDetail2Group, true)
      })

      const objs = [itemHover, bullet, itemLabel, itemZone]
      objs.forEach(o => o.setVisible(false))
      ddItems.push({ obj: objs })
    })

    drawDropdown(false)

    const levelHint = this.add.text(cx, by + headerH + itemH * levels.length + 16, 'ESC para volver', {
      fontSize: '13px', fontFamily: font, color: '#556666', resolution: dpr,
    }).setOrigin(0.5)

    this.levelGroup.addMultiple([
      ddBg, headerLabel, arrowText, headerZone,
      ...ddItems.flatMap(d => d.obj),
      levelHint,
    ])
    this.setGroupVisible(this.levelGroup, false)

    // ── helper: construye una pantalla de detalle de nivel ──────────────────
    const buildDetailScreen = (titleText, monsters, accentColor, accentGlow, levelNum) => {
      const grp = this.add.group()

      const bg = this.add.graphics()
      bg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x0d0d1a, 0x0d0d1a, 1)
      bg.fillRect(0, 0, width, height)
      for (let xd = 0; xd < width; xd += 40) {
        bg.lineStyle(1, 0x1a1a3e, 0.3); bg.lineBetween(xd, 0, xd, height)
      }
      for (let yd = 0; yd < height; yd += 40) {
        bg.lineStyle(1, 0x1a1a3e, 0.3); bg.lineBetween(0, yd, width, yd)
      }
      grp.add(bg)

      grp.add(
        this.add.text(cx, height * 0.13, titleText, {
          fontSize: '22px', fontFamily: font, fontStyle: 'bold',
          color: Phaser.Display.Color.IntegerToColor(accentColor).rgba,
          shadow: { offsetX: 0, offsetY: 0, color: Phaser.Display.Color.IntegerToColor(accentGlow).rgba, blur: 10, fill: true },
          resolution: dpr,
        }).setOrigin(0.5)
      )

      const sep1 = this.add.graphics()
      sep1.lineStyle(1, 0x335544, 0.8)
      sep1.lineBetween(cx - 280, height * 0.19, cx + 280, height * 0.19)
      grp.add(sep1)

      const n = monsters.length
      const colSpacing = Math.min(280, (width - 200) / (n + 1))
      const startX = cx - colSpacing * (n - 1) / 2
      const cols = monsters.map((_, i) => startX + i * colSpacing)

      monsters.forEach(({ key }, i) => {
        const img = this.add.image(cols[i], height * 0.35, key).setAlpha(0.95)
        const scale = Math.min(240 / img.width, 180 / img.height)
        img.setScale(scale)
        grp.add(img)
      })

      monsters.forEach(({ name }, i) => {
        grp.add(
          this.add.text(cols[i], height * 0.50, name, {
            fontSize: n > 3 ? '14px' : '16px', fontFamily: font, fontStyle: 'bold',
            color: '#00cc88', resolution: dpr,
          }).setOrigin(0.5)
        )
      })

      const sep2 = this.add.graphics()
      sep2.lineStyle(1, 0x335544, 0.8)
      sep2.lineBetween(cx - 280, height * 0.56, cx + 280, height * 0.56)
      grp.add(sep2)

      const statRows = [
        { label: 'Puntos de vida',      statKey: 'vida'     },
        { label: 'Puntos de daño',      statKey: 'dano'     },
        { label: 'Cantidad en el mapa', statKey: 'cantidad' },
      ]
      const statYs = [height * 0.64, height * 0.71, height * 0.78]

      const labelX = cols[0] - 24
      statRows.forEach(({ label, statKey }, ri) => {
        const y = statYs[ri]
        grp.add(
          this.add.text(labelX, y, label + ':', {
            fontSize: '16px', fontFamily: font, color: '#88aaaa', resolution: dpr,
          }).setOrigin(1, 0.5)
        )
        monsters.forEach((m, i) => {
          grp.add(
            this.add.text(cols[i], y, String(m[statKey]), {
              fontSize: '18px', fontFamily: font, fontStyle: 'bold',
              color: '#ffffff', resolution: dpr,
            }).setOrigin(0.5)
          )
        })
      })

      const sep3 = this.add.graphics()
      sep3.lineStyle(1, 0x335544, 0.8)
      sep3.lineBetween(cx - 280, height * 0.84, cx + 280, height * 0.84)
      grp.add(sep3)

      const playBtn = this.add.text(cx, height * 0.91, '▶   JUGAR', {
        fontSize: '26px', fontFamily: font, fontStyle: 'bold',
        color: Phaser.Display.Color.IntegerToColor(accentColor).rgba,
        shadow: { offsetX: 0, offsetY: 0, color: Phaser.Display.Color.IntegerToColor(accentGlow).rgba, blur: 10, fill: true },
        resolution: dpr,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      playBtn.on('pointerdown', () => { this._btnSound?.play(); this.startGame(levelNum) })
      grp.add(playBtn)

      this.tweens.add({ targets: playBtn, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 })

      this.setGroupVisible(grp, false)
      return grp
    }

    // ── LEVEL DETAIL — Nivel 1 ─────────────────────────────
    this.levelDetailGroup = buildDetailScreen(
      'Capítulo 1: Amenaza Radioactiva',
      [
        { key: 'monster',   name: 'Mutantes',       vida: 25,  dano: 2.5, cantidad: 50 },
        { key: 'serpiente', name: 'Mega Serpientes', vida: 50,  dano: 5,   cantidad: 25 },
        { key: 'arania',    name: 'Arañas Kaiju',    vida: 100, dano: 10,  cantidad: 5  },
      ],
      0x00ff88, 0x00ff88, 1
    )

    // ── LEVEL DETAIL — Nivel 2 ─────────────────────────────
    this.levelDetail2Group = buildDetailScreen(
      'Capítulo 2: La Rebelión de las Máquinas',
      [
        { key: 'robot_t700',     name: 'T-700',         vida: 25,  dano: 5,  cantidad: 50 },
        { key: 'robot_calavera', name: 'Kill Machine',  vida: 50,  dano: 10, cantidad: 25 },
        { key: 'robot_nave',     name: 'Exterminador',  vida: 300, dano: 10, cantidad: 5  },
      ],
      0x00ff88, 0x00ff88, 2
    )

    // ── INPUT ───────────────────────────────────────────────
    this.input.keyboard.on('keydown-ENTER', () => this.handleEnter())
    this.input.keyboard.on('keydown-SPACE', () => this.handleEnter())
    this.input.keyboard.on('keydown-ESC', () => this.handleEsc())
    startBtn.on('pointerdown', () => this.handleEnter())

    // ── Música de menú ─────────────────────────────────────────
    if (this.cache.audio.exists('musica_menu')) {
      this._menuMusic = this.sound.add('musica_menu', { loop: true, volume: 1.5 })
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

  _closeDropdown() {
    this._dropdownOpen = false
    this._drawDropdown?.(false)
    this._arrowText?.setText('▼')
    this._ddItems?.forEach(({ obj }) => obj.forEach(o => o.setVisible(false)))
  }

  handleEnter() {
    this._btnSound?.play()
    if (this.state === 'main') {
      this.state = 'levels'
      this.setGroupVisible(this.mainGroup, false)
      this._closeDropdown()
      this.setGroupVisible(this.levelGroup, true)
      this._closeDropdown()
    } else if (this.state === 'levelDetail') {
      this.startGame(this.selectedLevel)
    }
  }

  handleEsc() {
    if (this.state === 'levelDetail') {
      this.state = 'levels'
      this.setGroupVisible(this.levelDetailGroup, false)
      this.setGroupVisible(this.levelDetail2Group, false)
      this.setGroupVisible(this.levelGroup, true)
      this._closeDropdown()
    } else if (this.state === 'levels') {
      this.state = 'main'
      this.setGroupVisible(this.levelGroup, false)
      this.setGroupVisible(this.mainGroup, true)
    }
  }

  startGame(level = 1) {
    this.input.keyboard.removeAllListeners()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level })
    })
  }
}
