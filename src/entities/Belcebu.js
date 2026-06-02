import { Monster } from './Monster.js'

const TILE = 32
const SHOT_COOLDOWN = 300
const SHOT_RANGE    = 12

export class Belcebu extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'belcebu')

    const targetH = TILE * 9
    const src = scene.textures.get('belcebu').getSourceImage()
    this.setDisplaySize(Math.round(src.width * targetH / src.height), targetH)
    this.body.setSize(TILE * 8, TILE * 8)

    this.monsterType     = 'belcebu'
    this.health          = 500
    this.maxHealth       = 500
    this.attackDamage    = 50
    this.scoreValue      = 1000
    this.detectionRange  = 999
    this.territoryRadius = 999
    this.attackCooldown  = 2000
    this.stepInterval    = 480 + Math.random() * 200
    this.armor           = 10

    this._lastShot = 0

    this._soundTimer = scene.time.addEvent({
      delay: 3000, loop: true,
      callback: () => {
        if (!this.active || !scene.cache.audio.exists('sonido_belcebu')) return
        if (scene.sound.get('sonido_belcebu')?.isPlaying) return
        const player = scene.player
        if (!player) return
        const myDist2 = (this.x - player.x) ** 2 + (this.y - player.y) ** 2
        const maxRange = 30 * 32
        if (myDist2 > maxRange ** 2) return
        const isClosest = !scene.monsters.getChildren().some(m =>
          m !== this && m.active && m.monsterType === 'belcebu' &&
          (m.x - player.x) ** 2 + (m.y - player.y) ** 2 < myDist2
        )
        if (isClosest) {
          const dist = Math.sqrt(myDist2)
          const t = 1 - Phaser.Math.Clamp(dist / maxRange, 0, 1)
          const volume = 0.05 + t * 0.35
          scene.sound.play('sonido_belcebu', { volume })
          if (t > 0.7) scene.cameras.main.shake(700, 0.005)
        }
      },
    })
  }

  getInfoLines() {
    return [
      '[ BELCEBÚ ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Bolas de energía`,
    ]
  }

  hit(damage = 1) {
    return super.hit(Math.max(1, damage - this.armor))
  }

  // Solo movimiento horizontal; orienta el sprite según dirección
  stepTo(col, row) {
    if (row !== this.gridRow) return false
    const dCol = col - this.gridCol
    if (dCol > 0)      { this.setFlipX(false); this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
    return super.stepTo(col, row)
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= SHOT_RANGE && tileDist > 1 && time > this._lastShot + SHOT_COOLDOWN) {
      this._lastShot = time
      this._fireBolas(player)
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

    if (this.aiState === 'CHASE')        this._chasePlayer(player)
    else if (this.aiState === 'RETURN')  this._returnHome()
    else                                 this._patrol()
  }

  // Dispara 1 bola de energía por vez (ametralladora), dirección snapeada a 8 ángulos
  _fireBolas(player) {
    const rawAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
    const snapped  = Math.round(rawAngle / (Math.PI / 4)) * (Math.PI / 4)
    const speed    = 300
    const vx = Math.cos(snapped) * speed
    const vy = Math.sin(snapped) * speed
    const handX = this.x + (this.flipX ? -TILE * 2.5 : TILE * 2.5)
    const handY = this.y - TILE * 0.5
    if (this.scene.cache.audio.exists('sonido_bola_energia_belcebu'))
      this.scene.sound.play('sonido_bola_energia_belcebu', { volume: 0.5 })
    this.scene.spawnBolaEnergia(handX, handY, vx, vy, this.attackDamage)
  }

  die() {
    if (this._soundTimer) { this._soundTimer.remove(); this._soundTimer = null }
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 2.5, end: 0 },
      tint: 0xaa00ff,
      lifespan: 1000,
      quantity: 30,
      emitting: false,
    })
    particles.explode(30)
    this.scene.time.delayedCall(1100, () => particles.destroy())
    this.scene.events.emit('monsterKilled', this)
    this.destroy()
  }
}
