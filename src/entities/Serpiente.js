import { Monster } from './Monster.js'

const TILE = 32

export class Serpiente extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'serpiente')

    this.monsterType     = 'serpiente'
    this.health          = 300
    this.maxHealth       = 300
    this.scoreValue      = 100
    this.attackDamage    = 5
    this.detectionRange  = 12
    this.territoryRadius = 10
    this.attackCooldown  = 1500
    this.stepInterval    = 420 + Math.random() * 200

    const srcImg = scene.textures.get('serpiente').getSourceImage()
    const natW = srcImg.width  || 1
    const natH = srcImg.height || 1
    const headH = TILE * 2
    const displayW = Math.round((natW / natH) * headH)
    this.setDisplaySize(displayW, headH)
    this.body.setSize(displayW, headH)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.spitCooldown = 700
    this.lastSpit     = 0
    this.spitRange    = 12

    this._moveAngle = 0

    try {
      this._sound = scene.sound.add('sonidos_serpiente', { loop: true, volume: 0 })
      this._sound.play()
    } catch (e) {
      this._sound = null
    }
    try {
      this._scream = scene.sound.add('sonidos_serpiente_gritando', { volume: 0 })
    } catch (e) {
      this._scream = null
    }
    this._lastScream = 0
    this._lastVolUpdate = 0
  }

  die() {
    if (this._sound)  { this._sound.stop();  this._sound.destroy();  this._sound  = null }
    if (this._scream) { this._scream.stop();  this._scream.destroy(); this._scream = null }
    super.die()
  }

  getInfoLines() {
    return [
      '[ MEGA SERPIENTE ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Veneno radioactivo`,
    ]
  }

  // Returns the [dc, dr] unit vector of the direction the head is facing
  _forwardDir() {
    if (this._moveAngle === -90) return [ 0,  1]   // CCW → head down
    if (this._moveAngle ===  90) return [ 0, -1]   // CW  → head up
    return this.flipX ? [1, 0] : [-1, 0]
  }

  // Snake always tries to move forward first, only turns when blocked
  _chasePlayer(player) {
    const [fdc, fdr] = this._forwardDir()
    const dCol = player.gridCol - this.gridCol
    const dRow = player.gridRow - this.gridRow

    // 1. Try to keep going straight
    if (this.stepTo(this.gridCol + fdc, this.gridRow + fdr)) return

    // 2. Blocked — turn toward the player
    const turns = []
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      if (dCol !== 0) turns.push([Math.sign(dCol), 0])
      if (dRow !== 0) turns.push([0, Math.sign(dRow)])
    } else {
      if (dRow !== 0) turns.push([0, Math.sign(dRow)])
      if (dCol !== 0) turns.push([Math.sign(dCol), 0])
    }
    for (const [dc, dr] of turns) {
      if (this.stepTo(this.gridCol + dc, this.gridRow + dr)) return
    }

    this._patrol()
  }

  stepTo(col, row) {
    if (this.moving) return false
    if (!this.canMoveTo(col, row)) return false

    const dCol = col - this.gridCol
    const dRow = row - this.gridRow

    if      (dCol > 0) { this.setFlipX(true);  this._moveAngle =    0 }
    else if (dCol < 0) { this.setFlipX(false); this._moveAngle =    0 }
    else if (dRow > 0) { this.setFlipX(false); this._moveAngle =  -90 }  // CCW → head down
    else if (dRow < 0) { this.setFlipX(false); this._moveAngle =   90 }  // CW  → head up

    this.moving = true
    this.gridCol = col
    this.gridRow = row

    const tx = col * TILE + TILE / 2
    const ty = row * TILE + TILE / 2

    this.scene.tweens.add({
      targets: this,
      x: tx, y: ty,
      duration: this.stepInterval * 0.65,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.moving = false
        if (this.body && this.active) this.body.reset(tx, ty)
      },
    })

    return true
  }

  update(time, player) {
    if (!this.active) return

    // ── Volumen dinámico — solo la serpiente más cercana al jugador suena ──────
    if (this._sound && time > this._lastVolUpdate + 150) {
      this._lastVolUpdate = time
      const wv  = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      let vol = 0
      if (onScreen) {
        const myDist2 = (this.x - player.x) ** 2 + (this.y - player.y) ** 2
        const isClosest = !this.scene.monsters.getChildren().some(m =>
          m !== this && m.active && m.monsterType === 'serpiente' &&
          (m.x - player.x) ** 2 + (m.y - player.y) ** 2 < myDist2
        )
        if (isClosest) vol = Phaser.Math.Clamp(1 - Math.sqrt(myDist2) / 400, 0, 0.7)
      }
      this._sound.setVolume(vol)
    }

    // Sinusoidal body wave (rotation)
    this.setAngle(this._moveAngle + Math.sin(time * 0.008) * 12)

    // Squash-and-stretch along body axis for locomotion feel
    const contract = Math.sin(time * 0.011) * 0.09
    const vertical = (this._moveAngle === 90 || this._moveAngle === -90)
    if (vertical) {
      this.scaleX = this._baseScaleX * (1 - contract * 0.6)
      this.scaleY = this._baseScaleY * (1 + contract)
    } else {
      this.scaleX = this._baseScaleX * (1 + contract)
      this.scaleY = this._baseScaleY * (1 - contract * 0.6)
    }

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    // Spit — single direct projectile like a weapon shot
    // Grito al estar cerca
    if (this._scream && tileDist <= 4 && time > this._lastScream + 4000) {
      const wv = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      if (onScreen) {
        this._lastScream = time
        this._scream.setVolume(1.0)
        this._scream.play()
      }
    }

    this._updateAiState(player, tileDist)

    if (this.aiState === 'CHASE' && tileDist <= this.spitRange && tileDist > 1 && time > this.lastSpit + this.spitCooldown) {
      this.lastSpit = time
      if (this._sound) this._sound.setVolume(1.0)
      // Green flash on body
      this.setTint(0x44ff44)
      this.scene.time.delayedCall(120, () => { if (this.active) this.clearTint() })
      if (this.active) {
        // Turn head toward player (cardinal snap) before spitting
        const pdx = player.x - this.x
        const pdy = player.y - this.y
        if (Math.abs(pdx) >= Math.abs(pdy)) {
          this.setFlipX(pdx > 0)
          this._moveAngle = 0
        } else {
          this.setFlipX(false)
          this._moveAngle = pdy > 0 ? -90 : 90
        }
        const [fdc, fdr] = this._forwardDir()
        const mouthX = this.x + fdc * TILE * 1.5
        const mouthY = this.y + fdr * TILE * 1.5
        this.scene.spawnSerpenteBullet(mouthX, mouthY, player.x, player.y, this.attackDamage)
        if (this.scene.cache.audio.exists('sonidos_serpiente_gritando'))
          this.scene.sound.play('sonidos_serpiente_gritando', { volume: 0.35 })
      }
    }

    if (this.moving) return

    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }

    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    if (this.aiState === 'CHASE') {
      if (tileDist < 3) {
        this._retreatFrom(player)
      } else if (tileDist <= this.spitRange) {
        // En rango de disparo — no avanzar, dejar que el spit ataque
      } else {
        this._chasePlayer(player)
      }
    } else if (this.aiState === 'RETURN') {
      this._returnHome()
    } else {
      this._patrol()
    }
  }

  _retreatFrom(player) {
    const dCol = this.gridCol - player.gridCol
    const dRow = this.gridRow - player.gridRow
    const moves = []
    if (Math.abs(dCol) >= Math.abs(dRow)) {
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
    } else {
      if (dRow !== 0) moves.push([this.gridCol, this.gridRow + Math.sign(dRow)])
      if (dCol !== 0) moves.push([this.gridCol + Math.sign(dCol), this.gridRow])
    }
    for (const [col, row] of moves) {
      if (this.stepTo(col, row)) return
    }
    this._patrol()
  }

}
