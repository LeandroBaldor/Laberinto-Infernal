import { Monster } from './Monster.js'

const TILE = 32
const SHOT_RANGE    = 12
const BURST_VOLLEYS = 5      // cuántas veces dispara los 4 cañones por ráfaga
const BURST_DELAY   = 280    // ms entre cada volley (da separación visible entre bolas)
const BURST_PAUSE   = 3200   // ms de pausa entre ráfagas

export class Exterminador extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y)
    this.setTexture('robot_nave')
    const targetH = TILE * 5.5
    this.setDisplaySize(Math.round(this.width * targetH / this.height), Math.round(targetH))
    this.body.setSize(TILE * 5.5, TILE * 5.5)

    this.health = 600
    this.maxHealth = 600
    this.attackDamage = 50
    this.detectionRange = 10
    this.attackCooldown = 1500
    this.stepInterval = 500 + Math.random() * 200
    this.scoreValue = 300
    this.monsterType = 'exterminador'
    this.territoryRadius = 999

    this._lastBurst   = 0
    this._firing      = false
    this._volleyCount = 0
    this._nextVolley  = 0

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

  // Dispara 1 volley: 4 bolas simultáneas desde los 4 cañones apuntando al jugador
  _fireVolley(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
    const speed = 320
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed

    // Posiciones de los 4 cañones (esquinas del sprite), escalonados para separar proyectiles
    const offsets = [
      { dx: -TILE * 1.5, dy: -TILE * 1.5 },
      { dx:  TILE * 1.5, dy: -TILE * 1.5 },
      { dx: -TILE * 1.5, dy:  TILE * 1.5 },
      { dx:  TILE * 1.5, dy:  TILE * 1.5 },
    ]
    offsets.forEach(({ dx, dy }, i) => {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.active) return
        this.scene.spawnExterminadorBullet(this.x + dx, this.y + dy, vx, vy, this.attackDamage)
      })
    })

    if (this.scene.cache?.audio?.exists('sonido_disparo_l2'))
      this.scene.sound.play('sonido_disparo_l2', { volume: 0.45 })
    this.setTint(0x00eeff)
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint() })
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= SHOT_RANGE && tileDist > 1) {
      // Iniciar nueva ráfaga
      if (!this._firing && time > this._lastBurst + BURST_PAUSE) {
        this._firing      = true
        this._volleyCount = 0
        this._nextVolley  = time
      }
      // Disparar siguiente volley de la ráfaga
      if (this._firing && time >= this._nextVolley && this._volleyCount < BURST_VOLLEYS) {
        this._fireVolley(player)
        this._volleyCount++
        this._nextVolley = time + BURST_DELAY
        if (this._volleyCount >= BURST_VOLLEYS) {
          this._firing    = false
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
