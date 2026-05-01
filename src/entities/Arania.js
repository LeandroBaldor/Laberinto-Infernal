import { Monster } from './Monster.js'

const TILE = 32

export class Arania extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'arania')

    this.monsterType    = 'arania'
    this.health         = 100
    this.maxHealth      = 100
    this.scoreValue     = 300
    this.attackDamage   = 10
    this.detectionRange = 999
    this.attackCooldown = 2000
    this.stepInterval   = 550 + Math.random() * 250

    this.setDisplaySize(TILE * 5, TILE * 5)
    this.body.setSize(this.frame.realWidth, this.frame.realHeight)
    this.body.setOffset(0, 0)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.webCooldown = 15000
    this.lastWeb     = 0
    this.webRange    = 12

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

    // ── Volumen dinámico por proximidad ───────────────────────────────────────
    if (this._sound) {
      const wv  = this.scene.cameras.main.worldView
      const onScreen = this.x > wv.x && this.x < wv.right &&
                       this.y > wv.y && this.y < wv.bottom
      let vol = 0
      if (onScreen) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        vol = Phaser.Math.Clamp(1 - dist / 600, 0, 0.25)
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

    if (tileDist <= 2 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
    }

    if (tileDist <= this.webRange && tileDist > 2 && time > this.lastWeb + this.webCooldown) {
      this.lastWeb = time
      this.scene.spawnWeb(this.x, this.y, player.x, player.y)
    }

    if (time < this._lastStep + this.stepInterval) return
    this._lastStep = time

    this._chasePlayer(player)
  }
}
