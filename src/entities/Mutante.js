import { Monster } from './Monster.js'

const TILE = 32

export class Mutante extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster')

    this.monsterType     = 'mutante'
    this.health          = 50
    this.maxHealth       = 50
    this.scoreValue      = 50
    this.attackDamage    = 2.5
    this.detectionRange  = 8
    this.territoryRadius = 10
    this.attackCooldown  = 1000
    this.stepInterval    = 480 + Math.random() * 320

    this.setDisplaySize(TILE * 4, TILE * 4)
    this.body.setSize(TILE * 4, TILE * 4)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY
    this._stepCount  = 0
    this._lastSound  = Math.random() * 5000
  }

  getInfoLines() {
    return [
      '[ MUTANTE ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Cuerpo a cuerpo`,
    ]
  }

  stepTo(col, row) {
    if (this.moving) return false
    if (!this.canMoveTo(col, row)) return false

    this.moving = true
    this.gridCol = col
    this.gridRow = row

    const tx = col * TILE + TILE / 2
    const ty = row * TILE + TILE / 2

    const dCol = col - (tx - (col * TILE + TILE / 2) + this.gridCol) // just use step direction
    this._stepCount++
    const lean = (this._stepCount % 2 === 0) ? -16 : 16
    const bsx = this._baseScaleX
    const bsy = this._baseScaleY

    // Heavy zombie lurch: drop + lean on impact, then drag upright
    this.scene.tweens.add({
      targets: this,
      scaleX: bsx * 1.18,
      scaleY: bsy * 0.82,
      angle: lean,
      duration: 90,
      ease: 'Sine.easeIn',
      yoyo: true,
      onComplete: () => {
        if (this.scene && this.active) this.scene.tweens.add({
          targets: this,
          scaleX: bsx, scaleY: bsy, angle: 0,
          duration: 130, ease: 'Sine.easeOut',
        })
      },
    })

    this.scene.tweens.add({
      targets: this,
      x: tx, y: ty,
      duration: this.stepInterval * 0.65,
      ease: 'Linear',
      onComplete: () => {
        this.moving = false
        if (this.body && this.active) this.body.reset(tx, ty)
      },
    })

    return true
  }

  update(time, player) {
    if (!this.active) return

    if (!this.scene._mutanteSoundLast) this.scene._mutanteSoundLast = 0
    if (time > this.scene._mutanteSoundLast + 5000) {
      const wv = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      if (onScreen && this.scene.cache.audio.exists('sonidos_monster')) {
        this.scene._mutanteSoundLast = time
        this.scene.sound.play('sonidos_monster', { volume: 0.45 })
      }
    }

    // Slow idle sway even when standing still — gives zombie unease
    if (!this.moving) {
      const sway = Math.sin(time * 0.0018 + this.gridCol) * 4
      this.setAngle(sway)
    }

    if (this.moving) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }

    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    this._updateAiState(player, tileDist)
    if (this.aiState === 'CHASE') {
      this._chasePlayer(player)
    } else if (this.aiState === 'RETURN') {
      this._returnHome()
    } else {
      this._patrol()
    }
  }
}
