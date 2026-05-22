import { Monster } from './Monster.js'

const TILE = 32

export class Esqueletor extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'esqueletor')

    const targetH = TILE * 3.75
    const src = scene.textures.get('esqueletor').getSourceImage()
    this.setDisplaySize(Math.round(src.width * targetH / src.height), targetH)
    this.body.setSize(TILE * 3.75, TILE * 3.75)

    this.monsterType    = 'esqueletor'
    this.health         = 150
    this.maxHealth      = 150
    this.attackDamage   = 10
    this.scoreValue     = 100
    this.detectionRange = 8
    this.territoryRadius = 9
    this.attackCooldown = 900
    this.stepInterval   = 420 + Math.random() * 200
    this.armor          = 10

    this._stepCount = 0
    this._facingDir = 'down'

    this._soundTimer = scene.time.addEvent({
      delay: 10000, loop: true,
      callback: () => {
        if (!this.active || !scene.cache.audio.exists('sonido_esqueletor')) return
        if (scene.sound.get('sonido_esqueletor')?.isPlaying) return
        const player = scene.player
        if (!player) return
        const myDist2 = (this.x - player.x) ** 2 + (this.y - player.y) ** 2
        const isClosest = !scene.monsters.getChildren().some(m =>
          m !== this && m.active && m.monsterType === 'esqueletor' &&
          (m.x - player.x) ** 2 + (m.y - player.y) ** 2 < myDist2
        )
        if (isClosest) scene.sound.play('sonido_esqueletor', { volume: 0.4 })
      },
    })
  }

  die() {
    if (this._soundTimer) { this._soundTimer.remove(); this._soundTimer = null }
    super.die()
  }

  getInfoLines() {
    return [
      '[ ESQUELETOR ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Espada`,
    ]
  }

  hit(damage = 1) {
    return super.hit(Math.max(1, damage - this.armor))
  }

  stepTo(col, row) {
    const dCol = col - this.gridCol
    const dRow = row - this.gridRow
    if (dCol > 0)      this._facingDir = 'right'
    else if (dCol < 0) this._facingDir = 'left'
    else if (dRow < 0) this._facingDir = 'up'
    else if (dRow > 0) this._facingDir = 'down'

    this._stepCount++
    const lean      = (this._stepCount % 2 === 0) ? -7 : 7
    const baseAngle = this.angle

    if (!this.moving) {
      this.scene.tweens.add({
        targets: this, angle: baseAngle + lean,
        duration: 55, ease: 'Sine.easeOut', yoyo: true,
        onComplete: () => {
          if (this.active) this.scene.tweens.add({ targets: this, angle: baseAngle, duration: 55 })
        },
      })
    }

    return super.stepTo(col, row)
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      this._swordAttack(player)
      this.lastAttack = time
      return
    }

    if (this.moving) return
    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    this._updateAiState(player, tileDist)
    if (this.aiState === 'CHASE')        this._chasePlayer(player)
    else if (this.aiState === 'RETURN')  this._returnHome()
    else                                 this._patrol()
  }

  _swordAttack(player) {
    player.takeDamage(this.attackDamage)

    const dirAngles  = { right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 }
    const dirDegrees = { right: 0, left: 180, up: -90, down: 90 }
    const angle   = dirAngles[this._facingDir]  ?? 0
    const degrees = dirDegrees[this._facingDir] ?? 0
    const reach   = TILE * 1.8

    // Lunge forward
    const lx = this.x + Math.cos(angle) * TILE * 0.6
    const ly = this.y + Math.sin(angle) * TILE * 0.6
    this.scene.tweens.add({
      targets: this, x: lx, y: ly,
      duration: 60, ease: 'Sine.easeOut', yoyo: true,
      onComplete: () => { if (this.body && this.active) this.body.reset(this.x, this.y) },
    })

    // Rotation swing
    this.scene.tweens.add({
      targets: this, angle: degrees + 30,
      duration: 70, ease: 'Sine.easeIn', yoyo: true,
    })

    // Slash icon
    if (this.scene.textures.exists('sword')) {
      const sx = this.x + Math.cos(angle) * reach
      const sy = this.y + Math.sin(angle) * reach
      const icon = this.scene.add.image(sx, sy, 'sword')
        .setDisplaySize(TILE * 1.4, TILE * 1.4)
        .setAngle(degrees + 45)
        .setDepth(20)
      this.scene.tweens.add({
        targets: icon, alpha: 0, scaleX: 1.4, scaleY: 1.4,
        duration: 200, ease: 'Quad.easeOut',
        onComplete: () => icon.destroy(),
      })
    }

    if (this.scene.cache.audio.exists('sonidos_arma_espada'))
      this.scene.sound.play('sonidos_arma_espada', { volume: 0.5 })
  }
}
