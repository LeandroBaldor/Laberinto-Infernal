import { Monster } from './Monster.js'

const TILE = 32
const SHOT_COOLDOWN  = 200
const SHOT_RANGE     = 10

export class EvilSoldier extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'evil_soldier')

    const targetH = TILE * 4.7
    const src = scene.textures.get('evil_soldier').getSourceImage()
    this.setDisplaySize(Math.round(src.width * targetH / src.height), targetH)
    this.body.setSize(TILE * 4.7, TILE * 4.7)

    this.monsterType     = 'evil_soldier'
    this.health          = 300
    this.maxHealth       = 300
    this.attackDamage    = 20
    this.scoreValue      = 200
    this.detectionRange  = 10
    this.territoryRadius = 12
    this.attackCooldown  = 1200
    this.stepInterval    = 500 + Math.random() * 150


    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY
    this._stepCount  = 0
    this._lastShot   = 0

    this._soundTimer = scene.time.addEvent({
      delay: 10000, loop: true,
      callback: () => {
        if (!this.active || !scene.cache.audio.exists('sonido_evil_soldier')) return
        if (scene.sound.get('sonido_evil_soldier')?.isPlaying) return
        const player = scene.player
        if (!player) return
        const myDist2 = (this.x - player.x) ** 2 + (this.y - player.y) ** 2
        const isClosest = !scene.monsters.getChildren().some(m =>
          m !== this && m.active && m.monsterType === 'evil_soldier' &&
          (m.x - player.x) ** 2 + (m.y - player.y) ** 2 < myDist2
        )
        if (isClosest) scene.sound.play('sonido_evil_soldier', { volume: 0.4 })
      },
    })
  }

  die() {
    if (this._soundTimer) { this._soundTimer.remove(); this._soundTimer = null }
    super.die()
  }

  getInfoLines() {
    return [
      '[ EVIL SOLDIER ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Bolas de fuego`,
    ]
  }


  // Lurch estilo Mutante
  stepTo(col, row) {
    if (this.moving) return false
    if (!this.canMoveTo(col, row)) return false

    this.moving = true
    this.gridCol = col
    this.gridRow = row

    const tx = col * TILE + TILE / 2
    const ty = row * TILE + TILE / 2

    this._stepCount++
    const lean = (this._stepCount % 2 === 0) ? -14 : 14
    const bsx = this._baseScaleX
    const bsy = this._baseScaleY

    this.scene.tweens.add({
      targets: this,
      scaleX: bsx * 1.15, scaleY: bsy * 0.85, angle: lean,
      duration: 90, ease: 'Sine.easeIn', yoyo: true,
      onComplete: () => {
        if (this.scene && this.active) this.scene.tweens.add({
          targets: this, scaleX: bsx, scaleY: bsy, angle: 0,
          duration: 120, ease: 'Sine.easeOut',
        })
      },
    })

    this.scene.tweens.add({
      targets: this, x: tx, y: ty,
      duration: this.stepInterval * 0.65, ease: 'Linear',
      onComplete: () => {
        this.moving = false
        if (this.body && this.active) this.body.reset(tx, ty)
      },
    })

    return true
  }

  update(time, player) {
    if (!this.active) return

    if (!this.moving) {
      const sway = Math.sin(time * 0.0016 + this.gridCol) * 3
      this.setAngle(sway)
    }

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (
      this.aiState === 'CHASE' &&
      tileDist <= SHOT_RANGE && tileDist > 1 &&
      time > this._lastShot + SHOT_COOLDOWN
    ) {
      this._lastShot = time
      this._fireShot(player)
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

  _fireShot(player) {
    // Mirar hacia el jugador al disparar
    const facingRight = player.x >= this.x
    this.setFlipX(!facingRight)
    const offsetX = facingRight ? TILE * 0.3 : -TILE * 0.3
    const mouthX = this.x + offsetX
    const mouthY = this.y - TILE * 1.5
    this.scene.spawnBolaFuego(mouthX, mouthY, player.x, player.y, this.attackDamage)
    this.setTint(0xff6600)
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint() })
  }
}
