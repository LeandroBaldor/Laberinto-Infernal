import { Monster } from './Monster.js'

const TILE = 32
const SPEED = 360
const SHOT_COOLDOWN = 2800
const SHOT_RANGE   = 12

export class Exterminador extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_nave')
    const targetH = TILE * 4.2
    this.setDisplaySize(Math.round(this.width * targetH / this.height), Math.round(targetH))

    this.health = 300
    this.maxHealth = 300
    this.attackDamage = 12
    this.detectionRange = 10
    this.attackCooldown = 1500
    this.stepInterval = 500 + Math.random() * 200
    this.scoreValue = 300
    this.monsterType = 'exterminador'

    this._dc = 1
    this._dr = 0
    this._lastShot = 0
    this.territoryRadius = 999
  }

  stepTo(col, row) {
    const dCol = col - this.gridCol
    const dRow = row - this.gridRow
    if (dCol !== 0 || dRow !== 0) {
      this._dc = dCol !== 0 ? Math.sign(dCol) : 0
      this._dr = dRow !== 0 ? Math.sign(dRow) : 0
    }
    if (dCol > 0) { this.setFlipX(false); this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    return super.stepTo(col, row)
  }

  _aimAt(player) {
    const dCol = player.gridCol - this.gridCol
    const dRow = player.gridRow - this.gridRow
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      this._dc = Math.sign(dCol); this._dr = 0
    } else {
      this._dc = 0; this._dr = Math.sign(dRow)
    }
    if (this._dc > 0)      { this.setFlipX(false); this.setAngle(0) }
    else if (this._dc < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (this._dr < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (this._dr > 0) { this.setFlipX(false); this.setAngle(90) }
  }

  _fireBurst(player) {
    this._aimAt(player)
    const perp = { x: -this._dr, y: this._dc }
    const offsets = [-1.5, -0.5, 0.5, 1.5]
    offsets.forEach(t => {
      const fx = this.x + perp.x * TILE * t
      const fy = this.y + perp.y * TILE * t
      this.scene.spawnEnergyBall(fx, fy, this._dc * SPEED, this._dr * SPEED, this.attackDamage)
    })
    this.setTint(0xdd00ff)
    this.scene.time.delayedCall(200, () => { if (this.active) this.clearTint() })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= SHOT_RANGE && time > this._lastShot + SHOT_COOLDOWN) {
      this._lastShot = time
      this._fireBurst(player)
      return
    }

    if (this.moving) return
    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }
    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    if (this.aiState === 'CHASE') this._chasePlayer(player)
    else if (this.aiState === 'RETURN') this._returnHome()
    else this._patrol()
  }

  getInfoLines() {
    return [
      '[ EXTERMINADOR ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | 4 cañones × 2 tiros`,
    ]
  }

  die() {
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 100, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      tint: 0x8800ff,
      lifespan: 800,
      quantity: 24,
      emitting: false,
    })
    particles.explode(24)
    this.scene.time.delayedCall(900, () => particles.destroy())
    this.scene.events.emit('monsterKilled', this)
    this.destroy()
  }
}
