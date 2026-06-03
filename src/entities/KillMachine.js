import { Monster } from './Monster.js'

const TILE = 32
const BURST_SIZE  = 8
const BURST_DELAY = 100
const BURST_PAUSE = 1800

export class KillMachine extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_calavera')
    this.setDisplaySize(TILE * 3.125, TILE * 3.125)
    this.body.setSize(TILE * 3.125, TILE * 3.125)

    this.health = 300
    this.maxHealth = 300
    this.attackDamage = 5
    this.detectionRange = 10
    this.attackCooldown = 1200
    this.stepInterval = 450 + Math.random() * 150
    this.scoreValue = 100
    this.monsterType = 'killmachine'
    this.territoryRadius = 999

    this.shotRange = 10
    this._lastBurst = 0
    this._burstCount = 0
    this._nextShot = 0
    this._firing = false
    this._burstRad = 0
    this._burstSnd = null
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
    if (dCol > 0)      { this.setFlipX(false); this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    return super.stepTo(col, row)
  }

  _fireBullet() {
    this.scene.spawnEnemyImageBullet(
      'bala_killmachine',
      this.x, this.y,
      this.x + Math.cos(this._burstRad) * 1000,
      this.y + Math.sin(this._burstRad) * 1000,
      this.attackDamage
    )
  }

  _startBurstSound() {
    if (!this.scene.cache.audio.exists('sonido_killmachine_disparo')) return
    this._stopBurstSound()
    this._burstSnd = this.scene.sound.add('sonido_killmachine_disparo', { volume: 0.6, loop: true })
    this._burstSnd.play()
  }

  _stopBurstSound() {
    if (!this._burstSnd) return
    const snd = this._burstSnd
    this._burstSnd = null
    this.scene.tweens.add({
      targets: snd,
      volume: 0,
      duration: 350,
      onComplete: () => { if (snd.isPlaying) snd.stop(); snd.destroy() },
    })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= this.shotRange && tileDist > 1) {
      if (!this._firing && time > this._lastBurst + BURST_PAUSE) {
        this._burstRad = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
        this._firing = true
        this._burstCount = 0
        this._nextShot = time
        this._startBurstSound()
      }
      if (this._firing && time >= this._nextShot && this._burstCount < BURST_SIZE) {
        this._fireBullet()
        this._burstCount++
        this._nextShot = time + BURST_DELAY
        if (this._burstCount >= BURST_SIZE) {
          this._firing = false
          this._lastBurst = time
          this._stopBurstSound()
        }
        return
      }
    } else {
      if (this._firing) this._stopBurstSound()
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
    this._stopBurstSound()
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      tint: 0x00eeff,
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
