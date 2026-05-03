import { Monster } from './Monster.js'

const TILE = 32

export class KillMachine extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'kill_machine')

    this.monsterType     = 'kill_machine'
    this.health          = 50
    this.maxHealth       = 50
    this.scoreValue      = 100
    this.attackDamage    = 10
    this.detectionRange  = 12
    this.territoryRadius = 10
    this.attackCooldown  = 800
    this.stepInterval    = 440 + Math.random() * 200

    this.setDisplaySize(TILE * 3, TILE * 3)
    this.body.setSize(TILE * 2, TILE * 2)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.burstCooldown = 1200
    this.lastBurst     = 0
    this.burstRange    = 10
  }

  getInfoLines() {
    return [
      '[ KILL MACHINE ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      'DAÑO: 10 | Ametralladora',
    ]
  }

  update(time, player) {
    if (!this.active) return

    // Idle sway (like Mutante)
    if (!this.moving) {
      const sway = Math.sin(time * 0.002 + this.gridCol) * 3
      this.setAngle(sway)
    }

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    // Machine-gun burst at range 2–10 tiles
    if (
      this.aiState === 'CHASE' &&
      tileDist >= 2 && tileDist <= this.burstRange &&
      time > this.lastBurst + this.burstCooldown
    ) {
      this.lastBurst = time
      this.scene.spawnKillMachineBurst(this.x, this.y, player.x, player.y, this.attackDamage)
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
