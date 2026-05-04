import { Monster } from './Monster.js'

const TILE = 32

export class RobotAsesino extends Monster {
  constructor(scene, x, y) {
    super(scene, x, y, 'robot_asesino')

    this.monsterType     = 'robot_asesino'
    this.name            = 'Robot T-800'
    this.health          = 25
    this.maxHealth       = 25
    this.scoreValue      = 50
    this.attackDamage    = 5
    this.detectionRange  = 12
    this.territoryRadius = 10
    this.attackCooldown  = 1000
    this.stepInterval    = 380 + Math.random() * 150

    this.setDisplaySize(TILE, TILE)
    this.body.setSize(TILE * 0.75, TILE * 0.75)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY

    this.shotgunCooldown = 1500
    this.lastShotgun     = 0
    this.shotgunRange    = 10
  }

  getInfoLines() {
    return [
      '[ ROBOT T-800 ]',
      `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`,
      'DAÑO: 5 | Escopeta',
    ]
  }

  update(time, player) {
    if (!this.active) return

    const dx = Math.abs(this.gridCol - player.gridCol)
    const dy = Math.abs(this.gridRow - player.gridRow)
    const tileDist = dx + dy

    this._updateAiState(player, tileDist)

    // Shotgun burst at range 2–10 tiles
    if (
      this.aiState === 'CHASE' &&
      tileDist >= 2 && tileDist <= this.shotgunRange &&
      time > this.lastShotgun + this.shotgunCooldown
    ) {
      this.lastShotgun = time
      this.scene.spawnRobotShotgunBlast(this.x, this.y, player.x, player.y, this.attackDamage)
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
