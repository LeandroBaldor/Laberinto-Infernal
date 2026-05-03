
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
    this.state = 'main' // 'main' | 'levels' | 'levelDetail'
    this._selectedLevel = 1
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

    // ── LEVEL SELECT STATE (dropdown) ──────────────────────
    this.levelGroup = this.add.group()

    const cx = width / 2
    const by = height / 2 + 138

    const levelHeader = this.add.text(cx, by, 'SELECCIONAR NIVEL', {
      fontSize: '20px', fontFamily: font, color: '#ffffff', resolution: dpr,
    }).setOrigin(0.5)

    const ddW = 320, ddH = 52, ddY = by + 22
    const ddX0 = cx - ddW / 2

    const levelOpts = [
      { level: 1, label: 'NIVEL 1', sub: 'Amenaza Radioactiva'          },
      { level: 2, label: 'NIVEL 2', sub: 'La Rebelión de las Máquinas'  },
    ]

    this._ddOpen = false

    // ── Caja colapsada (siempre visible en levelGroup) ──
    const ddSelBox   = this.add.graphics()
    const ddSelLabel = this.add.text(cx - 10, ddY + 16, 'NIVEL 1', {
      fontSize: '13px', fontFamily: font, color: '#00aa66', resolution: dpr,
    }).setOrigin(0.5)
    const ddSelSub   = this.add.text(cx - 10, ddY + 35, 'Amenaza Radioactiva', {
      fontSize: '14px', fontFamily: font, fontStyle: 'bold', color: '#00ff88', resolution: dpr,
    }).setOrigin(0.5)
    const ddArrow    = this.add.text(cx + ddW / 2 - 18, ddY + ddH / 2, '▼', {
      fontSize: '14px', fontFamily: font, color: '#00ff88', resolution: dpr,
    }).setOrigin(0.5)

    const redrawSel = (open) => {
      ddSelBox.clear()
      ddSelBox.lineStyle(2, 0x00ff88, open ? 1 : 0.75)
      const r = open ? { tl: 8, tr: 8, bl: 0, br: 0 } : 8
      ddSelBox.strokeRoundedRect(ddX0, ddY, ddW, ddH, r)
      ddSelBox.fillStyle(0x00ff88, open ? 0.15 : 0.08)
      ddSelBox.fillRoundedRect(ddX0, ddY, ddW, ddH, r)
      ddArrow.setText(open ? '▲' : '▼')
    }
    redrawSel(false)

    // ── Lista desplegable ──
    this._ddListGroup = this.add.group()
    const itemH = 50
    const listH = levelOpts.length * itemH

    const listBg = this.add.graphics()
    listBg.lineStyle(2, 0x00ff88, 0.75)
    listBg.strokeRoundedRect(ddX0, ddY + ddH, ddW, listH, { tl: 0, tr: 0, bl: 8, br: 8 })
    listBg.fillStyle(0x080d10, 0.96)
    listBg.fillRoundedRect(ddX0, ddY + ddH, ddW, listH, { tl: 0, tr: 0, bl: 8, br: 8 })
    this._ddListGroup.add(listBg)

    levelOpts.forEach((opt, i) => {
      const iy   = ddY + ddH + i * itemH
      const itemBg = this.add.graphics()

      const draw = (hover) => {
        itemBg.clear()
        if (hover) { itemBg.fillStyle(0x00ff88, 0.14); itemBg.fillRect(ddX0 + 2, iy, ddW - 4, itemH) }
        if (i > 0) { itemBg.lineStyle(1, 0x224433, 0.6); itemBg.lineBetween(ddX0 + 8, iy, ddX0 + ddW - 8, iy) }
      }
      draw(false)

      const labT = this.add.text(cx, iy + 13, opt.label, {
        fontSize: '13px', fontFamily: font, color: '#00aa66', resolution: dpr,
      }).setOrigin(0.5)
      const subT = this.add.text(cx, iy + 32, opt.sub, {
        fontSize: '13px', fontFamily: font, fontStyle: 'bold', color: '#00ff88', resolution: dpr,
      }).setOrigin(0.5)

      const hit = this.add.zone(cx, iy + itemH / 2, ddW, itemH).setInteractive({ useHandCursor: true })
      hit.on('pointerover', () => draw(true))
      hit.on('pointerout',  () => draw(false))
      hit.on('pointerdown', () => {
        this._btnSound?.play()
        this._selectedLevel = opt.level
        // actualizar caja colapsada
        ddSelLabel.setText(opt.label)
        ddSelSub.setText(opt.sub)
        // cerrar dropdown y arrancar juego
        this._ddOpen = false
        redrawSel(false)
        this.setGroupVisible(this._ddListGroup, false)
        this.startGame()
      })

      this._ddListGroup.add(itemBg)
      this._ddListGroup.add(labT)
      this._ddListGroup.add(subT)
      this._ddListGroup.add(hit)
    })

    this._ddListGroup.getChildren().forEach(o => o.setVisible(false))

    // ── Toggle al hacer click en la caja ──
    const selHit = this.add.zone(cx, ddY + ddH / 2, ddW, ddH).setInteractive({ useHandCursor: true })
    selHit.on('pointerdown', () => {
      this._ddOpen = !this._ddOpen
      redrawSel(this._ddOpen)
      this.setGroupVisible(this._ddListGroup, this._ddOpen)
      if (this._ddOpen) this._ddListGroup.getChildren().forEach(o => this.children.bringToTop(o))
    })

    const levelHint = this.add.text(cx, ddY + ddH + 20, 'ESC para volver', {
      fontSize: '13px', fontFamily: font, color: '#556666', resolution: dpr,
    }).setOrigin(0.5)

    this.levelGroup.add(levelHeader)
    this.levelGroup.add(ddSelBox)
    this.levelGroup.add(ddSelLabel)
    this.levelGroup.add(ddSelSub)
    this.levelGroup.add(ddArrow)
    this.levelGroup.add(selHit)
    this.levelGroup.add(levelHint)

    this.setGroupVisible(this.levelGroup, false)

    // ── LEVEL DETAIL STATE (shared panel, content driven by _selectedLevel) ──
    this.levelDetailGroup = this.add.group()

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

    const levelDefs = [
      {
        title: 'Capítulo 1: Amenaza Radioactiva',
        color: '#00ff88', shadowColor: '#00ff88', sepColor: 0x335544,
        nameColor: '#00cc88',
        monsters: [
          { key: 'monster',   name: 'Mutantes',         vida: 25,  dano: 2.5, cantidad: 50 },
          { key: 'serpiente', name: 'Mega Serpientes',   vida: 50,  dano: 5,   cantidad: 25 },
          { key: 'arania',    name: 'Arañas Kaiju',      vida: 100, dano: 10,  cantidad: 5  },
        ],
        playable: true,
      },
      {
        title: 'Capítulo 2: La Rebelión de las Máquinas',
        color: '#ff6644', shadowColor: '#ff4422', sepColor: 0x554433,
        nameColor: '#cc8866',
        monsters: [
          { key: 'robot_asesino', name: 'Robot T-800',  vida: 25,  dano: 5,  cantidad: 50 },
          { key: 'kill_machine',  name: 'Kill Machine', vida: 50,  dano: 10, cantidad: 25, spriteScale: 1.6 },
          { key: 'exterminador',  name: 'Exterminador', vida: 300, dano: 10, cantidad: 5  },
        ],
        playable: false,
      },
    ]

    const dcols = [cx - 200, cx, cx + 200]

    const chapterTitleObj = this.add.text(cx, height * 0.13, '', {
      fontSize: '20px', fontFamily: font, fontStyle: 'bold',
      color: '#00ff88',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 10, fill: true },
      resolution: dpr,
    }).setOrigin(0.5)
    this.levelDetailGroup.add(chapterTitleObj)

    const dsep1 = this.add.graphics()
    this.levelDetailGroup.add(dsep1)

    const monsterImgs = dcols.map(x => {
      const img = this.add.image(x, height * 0.35, 'monster').setAlpha(0.95)
      this.levelDetailGroup.add(img)
      return img
    })
    const monsterNames = dcols.map(x => {
      const t = this.add.text(x, height * 0.50, '', {
        fontSize: '16px', fontFamily: font, fontStyle: 'bold',
        color: '#00cc88', resolution: dpr,
      }).setOrigin(0.5)
      this.levelDetailGroup.add(t)
      return t
    })

    const dsep2 = this.add.graphics()
    this.levelDetailGroup.add(dsep2)

    const statRows = [
      { label: 'Puntos de vida',      statKey: 'vida'     },
      { label: 'Puntos de daño',      statKey: 'dano'     },
      { label: 'Cantidad en el mapa', statKey: 'cantidad' },
    ]
    const statYs = [height * 0.62, height * 0.69, height * 0.76]

    statRows.forEach(({ label }, ri) => {
      const t = this.add.text(cx - 220, statYs[ri], label + ':', {
        fontSize: '15px', fontFamily: font, color: '#88aaaa', resolution: dpr,
      }).setOrigin(1, 0.5)
      this.levelDetailGroup.add(t)
    })

    const statValues = statRows.map((_, ri) =>
      dcols.map(x => {
        const t = this.add.text(x, statYs[ri], '', {
          fontSize: '17px', fontFamily: font, fontStyle: 'bold',
          color: '#ffffff', resolution: dpr,
        }).setOrigin(0.5)
        this.levelDetailGroup.add(t)
        return t
      })
    )

    const dsep3 = this.add.graphics()
    this.levelDetailGroup.add(dsep3)

    const detailPlay = this.add.text(cx, height * 0.89, '▶   JUGAR', {
      fontSize: '26px', fontFamily: font, fontStyle: 'bold',
      color: '#00ff88',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 10, fill: true },
      resolution: dpr,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    detailPlay.on('pointerdown', () => { this._btnSound?.play(); this.startGame() })
    this.levelDetailGroup.add(detailPlay)

    const detailLocked = this.add.text(cx, height * 0.89, '🔒  Completá el Nivel 1 para jugar este capítulo', {
      fontSize: '14px', fontFamily: font, color: '#556677', resolution: dpr,
    }).setOrigin(0.5)
    this.levelDetailGroup.add(detailLocked)

    this.tweens.add({ targets: detailPlay, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 })

    const detailBack = this.add.text(cx, height * 0.95, 'ESC para volver', {
      fontSize: '13px', fontFamily: font, color: '#445555', resolution: dpr,
    }).setOrigin(0.5)
    this.levelDetailGroup.add(detailBack)

    // Refreshes detail panel based on _selectedLevel
    this._refreshDetailPanel = () => {
      const def = levelDefs[this._selectedLevel - 1]

      chapterTitleObj.setText(def.title)
      chapterTitleObj.setStyle({ color: def.color, fontSize: '20px', fontFamily: font, fontStyle: 'bold' })
      chapterTitleObj.setShadow(0, 0, def.shadowColor, 10, true)

      dsep1.clear()
      dsep1.lineStyle(1, def.sepColor, 0.8)
      dsep1.lineBetween(cx - 280, height * 0.19, cx + 280, height * 0.19)

      def.monsters.forEach(({ key, name, spriteScale }, i) => {
        const texKey = this.textures.exists(key) ? key : 'monster'
        monsterImgs[i].setTexture(texKey)
        const extra = spriteScale ?? 1.0
        const base = Math.min(240 / monsterImgs[i].width, 180 / monsterImgs[i].height)
        monsterImgs[i].setScale(base * extra).setAlpha(0.95)
        monsterNames[i].setText(name).setStyle({ color: def.nameColor })
      })

      dsep2.clear()
      dsep2.lineStyle(1, def.sepColor, 0.8)
      dsep2.lineBetween(cx - 280, height * 0.56, cx + 280, height * 0.56)

      statRows.forEach(({ statKey }, ri) => {
        def.monsters.forEach((m, i) => statValues[ri][i].setText(String(m[statKey])))
      })

      dsep3.clear()
      dsep3.lineStyle(1, def.sepColor, 0.8)
      dsep3.lineBetween(cx - 280, height * 0.82, cx + 280, height * 0.82)

      detailPlay.setVisible(def.playable)
      detailLocked.setVisible(!def.playable)
    }

    this.setGroupVisible(this.levelDetailGroup, false)

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

  handleEnter() {
    this._btnSound?.play()
    if (this.state === 'main') {
      this.state = 'levels'
      this.setGroupVisible(this.mainGroup, false)
      this.setGroupVisible(this.levelGroup, true)
    } else if (this.state === 'levels') {
      // Enter confirma la selección actual y arranca
      if (!this._ddOpen) this.startGame()
    }
  }

  handleEsc() {
    if (this.state === 'levels') {
      if (this._ddOpen) {
        // Cierra el dropdown sin volver atrás
        this._ddOpen = false
        this.setGroupVisible(this._ddListGroup, false)
      } else {
        this.state = 'main'
        this.setGroupVisible(this.levelGroup, false)
        this.setGroupVisible(this.mainGroup, true)
      }
    }
  }

  startGame() {
    this.input.keyboard.removeAllListeners()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level: this._selectedLevel })
    })
  }
}
