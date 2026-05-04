import { Monster } from './Monster.js'

const TILE = 32
const SPEED = 380
const SPREAD = 0.38  // sin(~22°)

export class Robot extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_t700')
    this.setDisplaySize(TILE * 2, TILE * 2)

    this.health = 25
    this.maxHealth = 25
    this.attackDamage = 5
    this.detectionRange = 10
    this.attackCooldown = 1000
    this.stepInterval = 380 + Math.random() * 160
    this.scoreValue = 50
    this.monsterType = 'robot'

    this._dc = 1
    this._dr = 0
    this._lastShot = 0
    this._shotCooldown = 1800
    this._shotRange = 10
  }

  getInfoLines() {
    return [
      '[ T-700 ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Escopeta`,
    ]
  }

  stepTo(col, row) {
    const dCol = col - this.gridCol
    const dRow = row - this.gridRow
    if (dCol !== 0 || dRow !== 0) {
      this._dc = dCol !== 0 ? Math.sign(dCol) : 0
      this._dr = dRow !== 0 ? Math.sign(dRow) : 0
      if (dCol > 0) { this.setFlipX(false); this.setAngle(0) }
      else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
      else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
      else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    }
    return super.stepTo(col, row)
  }

  _fireShotgun(player, time) {
    this.lastAttack = time
    const fx = this.x + this._dc * TILE
    const fy = this.y + this._dr * TILE
    const perp = { x: -this._dr, y: this._dc }
    const shots = [
      { vx: this._dc,                      vy: this._dr },
      { vx: this._dc - perp.x * SPREAD,    vy: this._dr - perp.y * SPREAD },
      { vx: this._dc + perp.x * SPREAD,    vy: this._dr + perp.y * SPREAD },
    ]
    shots.forEach(({ vx, vy }) => {
      const len = Math.sqrt(vx * vx + vy * vy)
      this.scene.spawnRobotBullet(fx, fy, (vx / len) * SPEED, (vy / len) * SPEED, this.attackDamage)
    })
    this.setTint(0x88ccff)
    this.scene.time.delayedCall(120, () => { if (this.active) this.clearTint() })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= this._shotRange && tileDist > 1 && time > this.lastAttack + this._shotCooldown) {
      this._fireShotgun(player, time)
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
