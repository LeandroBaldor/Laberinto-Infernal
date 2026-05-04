import { Monster } from './Monster.js'

const TILE = 32
const SPEED = 450
const BURST_SIZE   = 10
const BURST_DELAY  = 100   // ms entre balas de la ráfaga
const BURST_PAUSE  = 1800  // ms entre ráfagas

export class KillMachine extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_calavera')
    this.setDisplaySize(TILE * 3.125, TILE * 3.125)

    this.health = 50
    this.maxHealth = 50
    this.attackDamage = 10
    this.detectionRange = 10
    this.attackCooldown = 1200
    this.stepInterval = 450 + Math.random() * 150
    this.scoreValue = 100
    this.monsterType = 'killmachine'

    this._dc = 1
    this._dr = 0
    this._shotRange = 12
    this._lastBurst = 0
    this._burstCount = 0
    this._nextShot = 0
    this._firing = false
  }

  getInfoLines() {
    return [
      '[ KILL MACHINE ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Ametralladora`,
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

  _fireBullet() {
    const fx = this.x + this._dc * TILE * 1.5
    const fy = this.y + this._dr * TILE * 1.5
    this.scene.spawnRobotBullet(fx, fy, this._dc * SPEED, this._dr * SPEED, this.attackDamage)
    this.setTint(0xff8844)
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint() })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    // Ráfaga de ametralladora
    if (this.aiState === 'CHASE' && tileDist <= this._shotRange && tileDist > 1) {
      if (!this._firing && time > this._lastBurst + BURST_PAUSE) {
        this._firing = true
        this._burstCount = 0
        this._nextShot = time
      }
      if (this._firing && time >= this._nextShot && this._burstCount < BURST_SIZE) {
        this._fireBullet()
        this._burstCount++
        this._nextShot = time + BURST_DELAY
        if (this._burstCount >= BURST_SIZE) {
          this._firing = false
          this._lastBurst = time
        }
        return
      }
    } else {
      this._firing = false
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
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      tint: 0xff4400,
      lifespan: 600,
      quantity: 16,
      emitting: false,
    })
    particles.explode(16)
    this.scene.time.delayedCall(700, () => particles.destroy())
    this.scene.events.emit('monsterKilled', this)
    this.destroy()
  }
}
