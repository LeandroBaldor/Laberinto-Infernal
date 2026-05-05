import { Monster } from './Monster.js'

const TILE = 32

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

    this.shotCooldown = 1800
    this.lastShot = 0
    this.shotRange = 12
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
    if (dCol > 0)      { this.setFlipX(true);  this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(false); this.setAngle(0) }
    else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    return super.stepTo(col, row)
  }

  _shoot(player) {
    const rad = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
    this.scene.spawnEnemyImageBullet(
      'bala_t700',
      this.x, this.y,
      this.x + Math.cos(rad) * 1000,
      this.y + Math.sin(rad) * 1000,
      this.attackDamage
    )
    if (this.scene.cache.audio.exists('sonido_t700_disparo'))
      this.scene.sound.play('sonido_t700_disparo', { volume: 0.7 })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= this.shotRange && tileDist > 1 && time > this.lastShot + this.shotCooldown) {
      this.lastShot = time
      this._shoot(player)
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
      tint: 0x00eeff,
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
