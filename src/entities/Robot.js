import { Monster } from './Monster.js'

const TILE = 32
const SPEED = 380
const SPREAD = 0.38

export class Robot extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_t700')
    this.setDisplaySize(TILE * 2, TILE * 2)

    this.health = 25
    this.maxHealth = 25
    this.attackDamage = 5
    this.detectionRange = 12
    this.attackCooldown = 1000
    this.stepInterval = 380 + Math.random() * 160
    this.scoreValue = 50
    this.monsterType = 'robot'
    this.territoryRadius = 999

    this._shotCooldown = 1800
    this._shotRange = 12
  }

  getInfoLines() {
    return [
      '[ T-700 ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Escopeta`,
    ]
  }

  _aimAt(player) {
    const dCol = player.gridCol - this.gridCol
    const dRow = player.gridRow - this.gridRow
    let dc, dr
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      dc = Math.sign(dCol); dr = 0
    } else {
      dc = 0; dr = Math.sign(dRow)
    }
    if (dc > 0)      { this.setFlipX(false); this.setAngle(0) }
    else if (dc < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (dr < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dr > 0) { this.setFlipX(false); this.setAngle(90) }
    return { dc, dr }
  }

  _fireShotgun(player, time) {
    this.lastAttack = time
    const { dc, dr } = this._aimAt(player)
    const fx = this.x + dc * TILE
    const fy = this.y + dr * TILE
    const perp = { x: -dr, y: dc }
    const shots = [
      { vx: dc,                      vy: dr },
      { vx: dc - perp.x * SPREAD,   vy: dr - perp.y * SPREAD },
      { vx: dc + perp.x * SPREAD,   vy: dr + perp.y * SPREAD },
    ]
    shots.forEach(({ vx, vy }) => {
      const len = Math.sqrt(vx * vx + vy * vy)
      this.scene.spawnRobotBullet(fx, fy, (vx / len) * SPEED, (vy / len) * SPEED, this.attackDamage)
    })
    this.setTint(0x88ccff)
    this.scene.time.delayedCall(120, () => { if (this.active) this.clearTint() })
  }

  stepTo(col, row) {
    const dCol = col - this.gridCol
    const dRow = row - this.gridRow
    if (dCol > 0)      { this.setFlipX(false); this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    return super.stepTo(col, row)
  }

  _backAway(player) {
    const dCol = this.gridCol - player.gridCol
    const dRow = this.gridRow - player.gridRow
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
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE') {
      if (tileDist <= this._shotRange && time > this.lastAttack + this._shotCooldown) {
        this._fireShotgun(player, time)
        return
      }
      if (this.moving) return
      if (time < this._lastStep + this.stepInterval) return
      this._lastStep = time
      if (tileDist <= 3) this._backAway(player)
      else this._chasePlayer(player)
      return
    }

    if (this.moving) return
    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time
    if (this.aiState === 'RETURN') this._returnHome()
    else this._patrol()
  }

  die() {
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      tint: 0x4488ff,
      lifespan: 500,
      quantity: 12,
      emitting: false,
    })
    particles.explode(12)
    this.scene.time.delayedCall(600, () => particles.destroy())
    this.scene.events.emit('monsterKilled', this)
    this.destroy()
  }
}
