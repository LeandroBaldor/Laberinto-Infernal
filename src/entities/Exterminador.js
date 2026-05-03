import { Monster } from './Monster.js'

const TILE = 32

export class Exterminador extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'exterminador')

    this.monsterType     = 'exterminador'
    this.health          = 300
    this.maxHealth       = 300
    this.scoreValue      = 300
    this.attackDamage    = 10
    this.detectionRange  = 12
    this.territoryRadius = 10
    this.attackCooldown  = 1500
    this.stepInterval    = 600 + Math.random() * 300

    this.setDisplaySize(TILE * 5.5, TILE * 5.5)
    this.body.setSize(TILE * 3, TILE * 3)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.cannonCooldown = 3000
    this.lastCannon     = 0
    this.cannonRange    = 10
  }

  getInfoLines() {
    return [
      '[ EXTERMINADOR ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      'DAÑO: 10 | Cuatro Cañones',
    ]
  }

  // Passes through walls but keeps minimum distance from other exterminadores
  canMoveTo(col, row) {
    const grid = this.scene.mazeGrid
    if (!grid) return false
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false
    for (const m of this.scene.monsters.getChildren()) {
      if (m === this || !m.active || m.monsterType !== 'exterminador') continue
      const dist = Math.abs(m.gridCol - col) + Math.abs(m.gridRow - row)
      if (dist < 8) return false
    }
    return true
  }

  update(time, player) {
    if (!this.active) return

    // Slow continuous rotation
    this.setAngle(this.angle + 0.3)

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    // 4-direction cannon blast at range <= 10 tiles
    if (
      this.aiState === 'CHASE' &&
      tileDist <= this.cannonRange &&
      time > this.lastCannon + this.cannonCooldown
    ) {
      this.lastCannon = time
      this.scene.spawnExterminadorBlast(this.x, this.y, this.attackDamage)
    }

    if (this.moving) return

    // Melee at tileDist <= 1
    if (tileDist <= 1 && time > this.lastAttack + this.attackCooldown) {
      player.takeDamage(this.attackDamage)
      this.lastAttack = time
      return
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
