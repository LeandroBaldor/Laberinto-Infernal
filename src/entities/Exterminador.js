import { Monster } from './Monster.js'

const TILE = 32
const SHOT_COOLDOWN = 3000
const SHOT_RANGE    = 12

export class Exterminador extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_nave')
    const targetH = TILE * 5.5
    this.setDisplaySize(Math.round(this.width * targetH / this.height), Math.round(targetH))
    this.body.setSize(TILE * 5.5, TILE * 5.5)

    this.health = 300
    this.maxHealth = 300
    this.attackDamage = 50
    this.detectionRange = 10
    this.attackCooldown = 1500
    this.stepInterval = 500 + Math.random() * 200
    this.scoreValue = 300
    this.monsterType = 'exterminador'
    this.territoryRadius = 999

    this._lastShot = 0

    // Ciclo de sonido global — una sola instancia para TODOS los Exterminadores
    if (!scene._extSndCycle) {
      scene._extSndCycle = true
      const playExtSnd = () => {
        if (!scene.sys.isActive()) return
        if (!scene.cache?.audio?.exists('sonido_exterminador')) return
        const snd = scene.sound.add('sonido_exterminador', { volume: 0.8 })
        snd.once('complete', () => {
          snd.destroy()
          scene.time.delayedCall(30000, playExtSnd)
        })
        snd.play()
      }
      scene.time.delayedCall(1000, playExtSnd)
      // Limpiar flag al cerrar la escena para que el próximo nivel pueda arrancar
      scene.events.once('shutdown', () => { scene._extSndCycle = false })
    }
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

  _fireBurst(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
    const speed = 320
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    for (let k = 0; k < 8; k++) {
      this.scene.time.delayedCall(k * 120, () => {
        if (this.active) this.scene.spawnExterminadorBullet(this.x, this.y, vx, vy, this.attackDamage)
      })
    }
    if (this.scene.cache?.audio?.exists('sonido_disparo_l2'))
      this.scene.sound.play('sonido_disparo_l2', { volume: 0.6 })
    this.setTint(0x00eeff)
    this.scene.time.delayedCall(200, () => { if (this.active) this.clearTint() })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= SHOT_RANGE && tileDist > 1 && time > this._lastShot + SHOT_COOLDOWN) {
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
      `DAÑO: ${this.attackDamage} | 4 cañones`,
    ]
  }

  die() {
    const particles = this.scene.add.particles(this.x, this.y, 'bullet', {
      speed: { min: 100, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      tint: 0x00eeff,
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
