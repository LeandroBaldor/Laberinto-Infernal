export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  init(data) {
    this.playerHealth   = data.health
    this.maxHealth      = data.maxHealth
    this.level          = data.level
    this.score          = data.score
    this.lives          = data.lives !== undefined ? data.lives : 3
    this._elapsedMs     = data.elapsedMs || 0
    this._armor         = data.armor    || 0
    this._armorMax      = data.armorMax || 0
    this._armorType     = data.armorType || null
    this._mutantCount      = data.mutantCount      ?? 0
    this._serpienteCount   = data.serpienteCount   ?? 0
    this._araniaCount      = data.araniaCount      ?? 0
    this._t700Count        = data.t700Count        ?? 0
    this._killMachineCount = data.killMachineCount ?? 0
    this._exterminadorCount= data.exterminadorCount?? 0
  }

  create() {
    const { width } = this.scale

    this.add.rectangle(0, 0, width, 70, 0x000000, 0.88).setOrigin(0, 0)

    // ── CORAZONES (vidas) + BARRA + NÚMERO DE VIDA ───────────────────────────
    const barX = 150
    this.livesText = this.add.text(barX - 4, 22, this._livesStr(this.lives), {
      fontSize: '30px', fontFamily: 'Courier New', color: '#ff3333',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0.5)
    this.add.rectangle(barX, 16, 102, 12, 0x550000).setOrigin(0, 0)
    this.healthBar = this.add.rectangle(barX + 1, 17, 100, 10, 0xff2222).setOrigin(0, 0)
    this.healthNum = this.add.text(barX + 108, 6, String(Math.ceil(this.playerHealth)), {
      fontSize: '30px', fontFamily: 'Courier New', color: '#ff3333',
      stroke: '#000000', strokeThickness: 3,
    })
    this.add.text(barX, 33, 'HP', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#882222',
    })

    // ── ARMOR BAR ─────────────────────────────────────────────────────────────
    const armorColor = this._armorColor(this._armorType)
    this.add.rectangle(barX, 40, 102, 10, 0x111122).setOrigin(0, 0)
    this.armorBar = this.add.rectangle(barX + 1, 41, 100, 8, armorColor).setOrigin(0, 0)
    this.armorNum = this.add.text(barX + 108, 38, String(Math.ceil(this._armor)), {
      fontSize: '14px', fontFamily: 'Courier New', color: '#aaaaff',
      stroke: '#000000', strokeThickness: 2,
    })
    this.add.text(barX - 4, 44, 'ARMADURA', {
      fontSize: '20px', fontFamily: 'Courier New', color: '#5555aa',
    }).setOrigin(1, 0.5)
    const initPct = this._armorMax > 0 ? this._armor / this._armorMax : 0
    this.armorBar.setSize(100 * initPct, 8)
    if (this._armorMax === 0) {
      this.armorBar.setVisible(false)
      this.armorNum.setVisible(false)
    }

    // ── TIMER + CONTADORES + SCORE (distribuidos uniformemente en el centro) ──
    // 5 elementos en la banda desde el fin del panel izquierdo (~260) hasta el borde
    const midY    = 28
    const labelY  = 52
    const panelEnd = 260
    const slotW   = (width - panelEnd) / 5

    const cx = (i) => panelEnd + slotW * i + slotW / 2   // centro del slot i

    this.timerText = this.add.text(cx(0), midY, this._fmtTime(Math.floor(this._elapsedMs / 1000)), {
      fontSize: '24px', fontFamily: 'Courier New', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5)
    this.add.text(cx(0), labelY, 'TIEMPO', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#555555',
    }).setOrigin(0.5, 0.5)

    const counterStyle = (color) => ({
      fontSize: '24px', fontFamily: 'Courier New', color,
      stroke: '#000000', strokeThickness: 3,
    })
    if (this.level === 1) {
      this.mutantText = this.add.text(cx(1), midY,
        `Mutantes: ${this._mutantCount}`, counterStyle('#ff8844')).setOrigin(0.5, 0.5)
      this.serpText = this.add.text(cx(2), midY,
        `Mega Serpiente: ${this._serpienteCount}`, counterStyle('#44ff88')).setOrigin(0.5, 0.5)
      this.araniaText = this.add.text(cx(3), midY,
        `Araña Kaiju: ${this._araniaCount}`, counterStyle('#bb88ff')).setOrigin(0.5, 0.5)
    } else {
      this.mutantText = this.add.text(cx(1), midY,
        `T-700: ${this._t700Count}`, counterStyle('#aabbcc')).setOrigin(0.5, 0.5)
      this.serpText = this.add.text(cx(2), midY,
        `Kill Machine: ${this._killMachineCount}`, counterStyle('#ff6633')).setOrigin(0.5, 0.5)
      this.araniaText = this.add.text(cx(3), midY,
        `Exterminador: ${this._exterminadorCount}`, counterStyle('#cc44ff')).setOrigin(0.5, 0.5)
    }

    // ── SCORE + NIVEL ─────────────────────────────────────────────────────────
    this.scoreText = this.add.text(cx(4), midY, `SCORE: ${this.score}`, {
      fontSize: '27px', fontFamily: 'Courier New', color: '#aaaaff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5)
    this.add.text(cx(4), labelY, `NIVEL ${this.level}`, {
      fontSize: '9px', fontFamily: 'Courier New', color: '#445566',
    }).setOrigin(0.5, 0.5)

    // ── Eventos ───────────────────────────────────────────────────────────────
    const game = this.scene.get('GameScene')

    game.events.on('maxHealthChanged', (maxHp) => {
      this.maxHealth = maxHp
    })

    game.events.on('healthChanged', (hp) => {
      const pct = Math.max(0, hp / this.maxHealth)
      this.healthBar.setSize(100 * pct, 10)
      this.healthBar.setFillStyle(pct > 0.5 ? 0xff2222 : pct > 0.25 ? 0xff8800 : 0xff0000)
      this.healthNum.setText(String(Math.max(0, Math.ceil(hp))))
    })

    game.events.on('scoreChanged', (score) => {
      this.scoreText.setText(`SCORE: ${score}`)
    })

    game.events.on('timerUpdate', (secs) => {
      this.timerText.setText(this._fmtTime(secs))
    })

    game.events.on('monsterCountChanged', (counts) => {
      if (this.level === 1) {
        this.mutantText.setText(`Mutantes: ${counts.mutant}`)
        this.serpText.setText(`Mega Serpiente: ${counts.serpiente}`)
        this.araniaText.setText(`Araña Kaiju: ${counts.arania}`)
      } else {
        this.mutantText.setText(`T-700: ${counts.t700}`)
        this.serpText.setText(`Kill Machine: ${counts.killMachine}`)
        this.araniaText.setText(`Exterminador: ${counts.exterminador}`)
      }
    })

    game.events.on('livesChanged', (lives) => {
      this.livesText.setText(this._livesStr(lives))
    })

    game.events.on('armorChanged', (armor, armorMax, armorType) => {
      const pct = armorMax > 0 ? Math.max(0, armor / armorMax) : 0
      this.armorBar.setSize(100 * pct, 8)
      this.armorBar.setFillStyle(this._armorColor(armorType))
      this.armorNum.setText(String(Math.max(0, Math.ceil(armor))))
      this.armorBar.setVisible(true)
      this.armorNum.setVisible(true)
    })
  }

  _armorColor(type) {
    return { silver: 0xaaaacc, gold: 0xddbb00, future: 0x00ccff }[type] || 0x6666aa
  }

  _livesStr(n) {
    return '♥ '.repeat(Math.max(0, n)).trimEnd()
  }

  _fmtTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }
}
