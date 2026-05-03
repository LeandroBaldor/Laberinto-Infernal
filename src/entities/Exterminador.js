import { Monster } from './Monster.js'

const TILE = 32

export class Exterminador extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_nave')
    const targetH = TILE * 5.625
    this.setDisplaySize(Math.round(this.width * targetH / this.height), Math.round(targetH))

    this.health = 300
    this.maxHealth = 300
    this.attackDamage = 10
    this.detectionRange = 10
    this.attackCooldown = 1500
    this.stepInterval = 500 + Math.random() * 200
    this.scoreValue = 300
    this.monsterType = 'exterminador'
  }

  stepTo(col, row) {
    const dCol = col - this.gridCol
    const dRow = row - this.gridRow
    if (dCol > 0) { this.setFlipX(false); this.setAngle(0) }
    else if (dCol < 0) { this.setFlipX(true);  this.setAngle(0) }
    else if (dRow < 0) { this.setFlipX(false); this.setAngle(-90) }
    else if (dRow > 0) { this.setFlipX(false); this.setAngle(90) }
    return super.stepTo(col, row)
  }

  getInfoLines() {
    return [
      '[ EXTERMINADOR ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} por ataque`,
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
