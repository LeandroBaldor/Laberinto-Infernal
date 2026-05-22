import { Monster } from './Monster.js'

const TILE = 32

export class Arania extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'arania')

    this.monsterType     = 'arania'
    this.health          = 600
    this.maxHealth       = 600
    this.scoreValue      = 300
    this.attackDamage    = 90
    this.detectionRange  = 999
    this.territoryRadius = 10
    this.attackCooldown  = 2000
    this.stepInterval    = 550 + Math.random() * 250

    this.setDisplaySize(TILE * 5, TILE * 5)
    this.body.setSize(TILE * 5, TILE * 5)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.webCooldown  = 15000
    this.lastWeb      = 0
    this.webRange     = 12
    this.biteCooldown = 4000
    this.lastBite     = 0
    this.biteRange    = 10

    try {
      this._sound = scene.sound.add('sonido_arana', { loop: true, volume: 0 })
      this._sound.play()
    } catch (e) {
      this._sound = null
    }
    try {
      this._scream = scene.sound.add('sonido_arana_grito', { volume: 0 })
    } catch (e) {
      this._scream = null
    }
    this._lastScream = 0
    this._lastVolUpdate = 0
  }

  getInfoLines() {
    return [
      '[ ARAÑA KAIJU ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      `DAÑO: ${this.attackDamage} | Telaraña 10s`,
    ]
  }

  // Araña passes through walls but keeps minimum distance from other aranias
  canMoveTo(col, row) {
    const grid = this.scene.mazeGrid
    if (!grid) return false
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false
    for (const m of this.scene.monsters.getChildren()) {
      if (m === this || !m.active || m.monsterType !== 'arania') continue
      const dist = Math.abs(m.gridCol - col) + Math.abs(m.gridRow - row)
      if (dist < 6) return false  // keep ~5 tile visual separation
    }
    return true
  }

  die() {
    if (this._sound)  { this._sound.stop();  this._sound.destroy();  this._sound  = null }
    if (this._scream) { this._scream.stop();  this._scream.destroy(); this._scream = null }
    super.die()
  }

  update(time, player) {
    if (!this.active) return

    // ── Volumen dinámico — solo la araña más cercana al jugador suena ─────────
    if (this._sound && time > this._lastVolUpdate + 150) {
      this._lastVolUpdate = time
      const wv  = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      let vol = 0
      if (onScreen) {
        const myDist2 = (this.x - player.x) ** 2 + (this.y - player.y) ** 2
        const isClosest = !this.scene.monsters.getChildren().some(m =>
          m !== this && m.active && m.monsterType === 'arania' &&
          (m.x - player.x) ** 2 + (m.y - player.y) ** 2 < myDist2
        )
        if (isClosest) vol = Phaser.Math.Clamp(1 - Math.sqrt(myDist2) / 400, 0, 0.7)
      }
      this._sound.setVolume(vol)
    }

    // ── Grito al acercarse ────────────────────────────────────────────────────
    if (this._scream) {
      const dx = Math.abs(this.gridCol - player.gridCol)
      const dy = Math.abs(this.gridRow - player.gridRow)
      const wv = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      if (onScreen && dx + dy <= 10 && time > this._lastScream + 3000) {
        this._lastScream = time
        this._scream.setVolume(0.9)
        this._scream.play()
      }
    }

    // ── Walking animation — cara siempre hacia el jugador ────────────────────
    const snapCycle = Math.sin(time * 0.025)
    const snap = Math.sign(snapCycle) * 7
    const angleToPlayer = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
    )
    this.setAngle(angleToPlayer - 90 + snap)

    // Body bobs up on each snap (abs gives twice-per-cycle pulse)
    const bob = Math.abs(snapCycle) * 0.07
    this.scaleX = this._baseScaleX * (1 + bob * 0.5)
    this.scaleY = this._baseScaleY * (1 + bob)

    if (this.moving) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    if (tileDist <= 2 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }

    if (this.aiState === 'CHASE' && tileDist <= this.webRange && tileDist > 2 && time > this.lastWeb + this.webCooldown) {
      this.lastWeb = time
      this.scene.spawnWeb(this.x, this.y, player.x, player.y)
    }

    if (this.aiState === 'CHASE' && tileDist <= this.biteRange && tileDist > 1 && time > this.lastBite + this.biteCooldown) {
      this.lastBite = time
      this.scene.spawnAraniaBullet(this.x, this.y, player.x, player.y, this.attackDamage)
    }

    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    if (this.aiState === 'CHASE') {
      this._chasePlayer(player)
    } else if (this.aiState === 'RETURN') {
      this._returnHome()
    } else {
      this._patrol()
    }
  }
}
