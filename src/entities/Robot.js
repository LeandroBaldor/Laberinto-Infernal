import { Monster } from './Monster.js'

const TILE = 32

export class Robot extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot')
    this.setDisplaySize(TILE * 2, TILE * 2)

    this.health = 30
    this.maxHealth = 30
    this.attackDamage = 5
    this.detectionRange = 12
    this.attackCooldown = 1000
    this.stepInterval = 380 + Math.random() * 160
    this.scoreValue = 20
  }

  getInfoLines() {
    return [
      '[ ROBOT ASESINO ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} por ataque`,
    ]
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
