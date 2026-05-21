const TILE = 32

export class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'monster') {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDisplaySize(TILE * 2, TILE * 2)
    this.body.setSize(TILE * 2, TILE * 2)
    this.setDepth(9)

    this.gridCol = Math.round((x - TILE / 2) / TILE)
    this.gridRow = Math.round((y - TILE / 2) / TILE)
    this.moving = false

    this.homeCol = this.gridCol
    this.homeRow = this.gridRow
    this.territoryRadius = 9
    this.aiState = 'PATROL'

    this.monsterType = 'mutant'
    this.health = 25
    this.maxHealth = 25
    this.scoreValue = 50
    this.attackDamage = 2.5
    this.detectionRange = 8
    this.attackCooldown = 1000
    this.lastAttack = 0

    this.stepInterval = 480 + Math.random() * 320
    this._lastStep = 0
  }

  getInfoLines() {
    return [
      '[ MUTANTE ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Cuerpo a cuerpo`,
    ]
  }

  canMoveTo(col, row) {
    const grid = this.scene.mazeGrid
    if (!grid || row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false
    return grid[row][col] === 0
  }

  stepTo(col, row) {
    if (this.moving) return false
    if (!this.canMoveTo(col, row)) return false

    this.moving = true
    this.gridCol = col
    this.gridRow = row

    const tx = col * TILE + TILE / 2
    const ty = row * TILE + TILE / 2

    this.scene.tweens.add({
      targets: this,
      x: tx,
      y: ty,
      duration: this.stepInterval * 0.65,
      ease: 'Linear',
      onComplete: () => {
        this.moving = false
        if (this.body && this.active) this.body.reset(tx, ty)
      },
    })
    return true
  }

  update(time, player) {
    if (!this.active) return
    if (this.moving) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }

    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    this._updateAiState(player, tileDist)
    if (this.aiState === 'CHASE') {
      this._chasePlayer(player)
    } else if (this.aiState === 'RETURN') {
      this._returnHome()
    } else {
      this._patrol()
    }
  }

  _updateAiState(player, tileDist) {
    const myDistFromHome = Math.abs(this.gridCol - this.homeCol) + Math.abs(this.gridRow - this.homeRow)
    if (tileDist <= this.detectionRange && myDistFromHome <= this.territoryRadius) {
      this.aiState = 'CHASE'
    } else if (this.aiState === 'CHASE') {
      this.aiState = 'RETURN'
    }
  }

  _returnHome() {
    const dCol = this.homeCol - this.gridCol
    const dRow = this.homeRow - this.gridRow

    if (dCol === 0 && dRow === 0) {
      this.aiState = 'PATROL'
      return
    }

    const moves = []
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
    } else {
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
    }

    for (const [col, row] of moves) {
      if (this.stepTo(col, row)) return
    }
    this._patrol()
  }

  _chasePlayer(player) {
    const dCol = player.gridCol - this.gridCol
    const dRow = player.gridRow - this.gridRow

    const moves = []
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
    } else {
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
    }

    for (const [col, row] of moves) {
      if (this.stepTo(col, row)) return
    }
    this._patrol()
  }

  _patrol() {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]]
    }
    for (const [dc, dr] of dirs) {
      const nc = this.gridCol + dc
      const nr = this.gridRow + dr
      if (Math.abs(nc - this.homeCol) + Math.abs(nr - this.homeRow) > this.territoryRadius) continue
      if (this.stepTo(nc, nr)) return
    }
  }

  hit(damage = 1) {
    this.health -= damage
    this.setTint(0xff3333)
    this.scene.time.delayedCall(150, () => {
      if (this.active) this.clearTint()
    })

    this.showHealthBar()

    if (this.health <= 0) {
      this.die()
      return true
    }
    return false
  }

  showHealthBar() {
    const W = 60, H = 8
    const pct = Math.max(0, this.health / this.maxHealth)
    const fillW = Math.max(1, Math.floor(W * pct))
    const color = pct > 0.5 ? 0x00dd44 : pct > 0.25 ? 0xffaa00 : 0xff2200
    const by = this.y - this.displayHeight / 2 - 18

    if (!this._hpBg) {
      this._hpBg    = this.scene.add.rectangle(this.x, by, W + 6, H + 6, 0x000000).setDepth(150).setAlpha(0.85)
      this._hpTrack = this.scene.add.rectangle(this.x, by, W, H, 0x770000).setDepth(151)
      this._hpFill  = this.scene.add.rectangle(this.x - W / 2, by, fillW, H, color).setDepth(152).setOrigin(0, 0.5)
      this._hpLabel = this.scene.add.text(this.x, by - 13, '', {
        fontSize: '14px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      }).setDepth(153).setOrigin(0.5, 0.5)
    } else {
      this._hpFill.setSize(fillW, H)
      this._hpFill.setFillStyle(color)
    }

    this._hpLabel.setText(`${Math.max(0, Math.ceil(this.health))} / ${this.maxHealth}`)
    this._repositionHpBar(by)

    this._hpBg.setVisible(true)
    this._hpTrack.setVisible(true)
    this._hpFill.setVisible(true)
    this._hpLabel.setVisible(true)

    if (this._hpHideTimer) this._hpHideTimer.remove()
    this._hpHideTimer = this.scene.time.delayedCall(2500, () => this._hideHealthBar())
  }

  _repositionHpBar(by) {
    const W = 60
    const _by = by ?? (this.y - this.displayHeight / 2 - 18)
    this._hpBg.setPosition(this.x, _by)
    this._hpTrack.setPosition(this.x, _by)
    this._hpFill.setPosition(this.x - W / 2, _by)
    this._hpLabel.setPosition(this.x, _by - 13)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)
    if (this._hpBg?.visible) this._repositionHpBar()
  }

  _hideHealthBar() {
    this._hpBg?.setVisible(false)
    this._hpTrack?.setVisible(false)
    this._hpFill?.setVisible(false)
    this._hpLabel?.setVisible(false)
  }

  _destroyHealthBar() {
    if (this._hpHideTimer) { this._hpHideTimer.remove(); this._hpHideTimer = null }
    this._hpBg?.destroy()
    this._hpTrack?.destroy()
    this._hpFill?.destroy()
    this._hpLabel?.destroy()
    this._hpBg = this._hpTrack = this._hpFill = this._hpLabel = null
  }

  die() {
    this._destroyHealthBar()
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint: 0xff8800,
      lifespan: 400,
      quantity: 8,
      emitting: false,
    })
    particles.explode(8)
    this.scene.time.delayedCall(500, () => particles.destroy())
    this.scene.events.emit('monsterKilled', this)
    this.destroy()
  }
}
