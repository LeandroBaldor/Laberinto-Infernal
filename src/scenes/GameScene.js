import { generateMaze, getFloorCells, getFarCell } from '../utils/MazeGenerator.js'
import { Player, WEAPON_STATS, ARMOR_STATS } from '../entities/Player.js'
import { Monster } from '../entities/Monster.js'
import { Mutante } from '../entities/Mutante.js'
import { Serpiente } from '../entities/Serpiente.js'
import { Arania } from '../entities/Arania.js'
import { Robot } from '../entities/Robot.js'
import { KillMachine } from '../entities/KillMachine.js'
import { Exterminador } from '../entities/Exterminador.js'

const TILE = 32

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  init(data) {
    this.level        = data.level      || 1
    this.score        = data.score      || 0
    this.lives        = data.lives      !== undefined ? data.lives : 3
    this._elapsedMs   = data.elapsedMs  || 0
    this._savedInv    = data.inventory  || null   // [[type, ammo], ...]
    this._savedWeapon = data.activeWeapon || null
    this._savedArmor  = data.savedArmor || null   // { type, armor, armorMax }
  }

  create() {
    const COLS = 101 + this.level * 8
    const ROWS = 79  + this.level * 8

    this.mazeGrid = generateMaze(COLS, ROWS)
    this.mazeCols = this.mazeGrid[0].length
    this.mazeRows = this.mazeGrid.length

    const worldWidth = this.mazeCols * TILE
    const worldHeight = this.mazeRows * TILE

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.walls = this.physics.add.staticGroup()

    const _hasWall2 = this.textures.exists('wall_l2_2')
    const WALL_KEYS = this.level >= 2
      ? (_hasWall2
          ? ['wall_l2', 'wall_l2', 'wall_l2', 'wall_l2', 'wall_l2', 'wall_l2_2']
          : ['wall_l2'])
      : [
          'wall', 'wall', 'wall',
          'wall2', 'wall2',
          'wall_tree', 'wall_tree',
          'wall_fire',
          'wall_ruins',
          'wall_charred',
          'wall_park',
          'wall_school',
          'wall_bomb',
        ]
    const FLOOR_KEYS = this.level >= 2
      ? ['floor_l2', 'floor_l2b', 'floor_l2c', 'floor_l2d']
      : ['floor', 'floor', 'floor', 'floor2', 'floor3']

    for (let r = 0; r < this.mazeRows; r++) {
      for (let c = 0; c < this.mazeCols; c++) {
        const x = c * TILE + TILE / 2
        const y = r * TILE + TILE / 2
        if (this.mazeGrid[r][c] === 1) {
          const wKey = WALL_KEYS[Math.floor(Math.random() * WALL_KEYS.length)]
          const angle = this.level >= 2 ? [0, 90, 180, 270][Math.floor(Math.random() * 4)] : 0
          const w = this.walls.create(x, y, wKey).setDepth(1).setAngle(angle)
          if (this.level >= 2) w.setDisplaySize(TILE, TILE)
        } else {
          const fKey = FLOOR_KEYS[Math.floor(Math.random() * FLOOR_KEYS.length)]
          const angle = this.level >= 2 ? [0, 90, 180, 270][Math.floor(Math.random() * 4)] : 0
          const f = this.add.image(x, y, fKey).setDepth(0).setAngle(angle)
          if (this.level >= 2) f.setDisplaySize(TILE, TILE)
        }
      }
    }

    const floorCells = getFloorCells(this.mazeGrid)

    this.player = new Player(this, 1 * TILE + TILE / 2, 1 * TILE + TILE / 2)
    try {
      this.player._footstepSound = this.sound.add('sonidos_pies_protagonista', { volume: 1.0 })
    } catch (e) {
      this.player._footstepSound = null
    }
    // Restore inventory from previous level
    if (this._savedInv) {
      for (const [type, ammo] of this._savedInv) this.player.inventory.set(type, ammo)
      this.player.activeWeapon = this._savedWeapon
      this.player._emitWeaponState()
    }
    // Restore armor from previous level
    if (this._savedArmor) {
      this.player.armorType = this._savedArmor.type
      this.player.armorMax  = this._savedArmor.armorMax
      this.player.armor     = this._savedArmor.armor
      const aStats = ARMOR_STATS[this._savedArmor.type]
      this.player.damageMultiplier = aStats.dmgMult
      this.player.ammoMultiplier   = aStats.ammoMult
      this.player._updateSprite()
    }

    // Exit placed far from start (minimum 35 tiles manhattan distance)
    const exitCell = getFarCell(floorCells, 1, 1, 35)
    const exitX = exitCell.col * TILE + TILE / 2
    const exitY = exitCell.row * TILE + TILE / 2
    this.exit = this.physics.add.staticSprite(exitX, exitY, 'exit')
      .setDepth(3).setDisplaySize(TILE * 2.5, TILE * 2.5)
    this.exit.body.setSize(TILE, TILE)

    // Exit starts LOCKED — red tint until player picks up the key
    this.exit.setTint(0xff3333)
    this.tweens.add({
      targets: this.exit, alpha: 0.4, scaleX: 1.1, scaleY: 1.1,
      duration: 700, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
    })
    this.exitRing = this.add.graphics().setDepth(2)
    this.exitRing.fillStyle(0xff2200, 0.2)
    this.exitRing.fillCircle(exitX, exitY, TILE * 2)
    this.tweens.add({ targets: this.exitRing, alpha: 0.04, duration: 700, yoyo: true, repeat: -1 })

    this.monsters = this.physics.add.group()
    const usedCells = new Set([`1,1`, `${exitCell.row},${exitCell.col}`])

    // ── KEY — must be picked up to unlock the exit ────────────────────────────
    const keyCell = getFarCell(floorCells, exitCell.row, exitCell.col, 20)
    usedCells.add(`${keyCell.row},${keyCell.col}`)
    const keyX = keyCell.col * TILE + TILE / 2
    const keyY = keyCell.row * TILE + TILE / 2
    this.keyItem = this.physics.add.staticSprite(keyX, keyY, 'key')
      .setDepth(4).setDisplaySize(TILE * 1.5, TILE * 0.9)
    this.tweens.add({
      targets: this.keyItem,
      y: keyY - 4, angle: 8,
      duration: 800, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
    })
    // Golden glow ring under key
    const keyRing = this.add.graphics().setDepth(3)
    keyRing.fillStyle(0xffdd00, 0.22)
    keyRing.fillCircle(keyX, keyY, TILE * 1.2)
    this.tweens.add({ targets: keyRing, alpha: 0.05, duration: 800, yoyo: true, repeat: -1 })

    const spawnEnemy = (EnemyClass, extraSetup) => {
      let cell, attempts = 0
      do {
        cell = floorCells[Math.floor(Math.random() * floorCells.length)]
        attempts++
      } while (
        (usedCells.has(`${cell.row},${cell.col}`) ||
          (Math.abs(cell.row - 1) + Math.abs(cell.col - 1)) < 5) &&
        attempts < 50
      )
      usedCells.add(`${cell.row},${cell.col}`)
      const e = new EnemyClass(this, cell.col * TILE + TILE / 2, cell.row * TILE + TILE / 2)
      if (extraSetup) extraSetup(e)
      this.monsters.add(e)
      return e
    }

    if (this.level === 1) {
      this.mutantCount    = 50
      this.serpienteCount = 25
      this.araniaCount    = 5
      this.t700Count      = 0
      this.killMachineCount = 0
      this.exterminadorCount = 0

      for (let i = 0; i < this.mutantCount; i++) {
        spawnEnemy(Mutante, (m) => {
          m.detectionRange = 11
          m.stepInterval   = 510 + Math.random() * 100
          m.attackDamage   = 2.5
        })
      }
      for (let i = 0; i < this.serpienteCount; i++) spawnEnemy(Serpiente, null)
      for (let i = 0; i < this.araniaCount; i++) spawnEnemy(Arania, null)
    } else {
      this.mutantCount       = 0
      this.serpienteCount    = 0
      this.araniaCount       = 0
      this.t700Count         = 50
      this.killMachineCount  = 25
      this.exterminadorCount = 5

      for (let i = 0; i < this.t700Count; i++) spawnEnemy(Robot, null)
      for (let i = 0; i < this.killMachineCount; i++) spawnEnemy(KillMachine, null)
      for (let i = 0; i < this.exterminadorCount; i++) spawnEnemy(Exterminador, null)
    }

    this.enemyProjectiles = this.physics.add.group()

    // ── Weapon pickups ───────────────────────────────────────────────────────
    const weaponDefs = [
      { groupKey: 'swords',        wType: 'sword',   texKey: 'sword',         count: 150, tint: 0xffdd44 },
      { groupKey: 'arrowPickups',  wType: 'arrow',   texKey: 'arrow',         count: 150, tint: 0x88ddff },
      { groupKey: 'shotgunPickups',wType: 'shotgun', texKey: 'shotgun',       count: 100, tint: 0xff8833 },
      { groupKey: 'futurePickups', wType: 'future',  texKey: 'future_weapon', count:  50, tint: 0x00ffff },
      ...(this.level >= 2 ? [
        { groupKey: 'ametralladoraPickups', wType: 'ametralladora', texKey: 'ametralladora', count: 100, tint: 0xffcc00 },
        { groupKey: 'llamasPickups',        wType: 'lanzallamas',   texKey: 'lanzallamas',   count:  60, tint: 0xff4400 },
      ] : []),
    ]
    for (const def of weaponDefs) {
      this[def.groupKey] = this.physics.add.staticGroup()
      for (let n = 0; n < def.count; n++) {
        let cell, attempts = 0
        do {
          cell = floorCells[Math.floor(Math.random() * floorCells.length)]
          attempts++
        } while (usedCells.has(`${cell.row},${cell.col}`) && attempts < 50)
        usedCells.add(`${cell.row},${cell.col}`)
        const wx = cell.col * TILE + TILE / 2
        const wy = cell.row * TILE + TILE / 2

        // White glowing tile (no tint — stays white)
        const tile = this[def.groupKey].create(wx, wy, 'weapon_tile').setDepth(2)
        this.tweens.add({
          targets: tile, alpha: 0.55,
          duration: 700 + n * 120, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
        })

        // Weapon icon: blinks and grows 50%
        const icon = this.add.image(wx, wy, def.texKey).setDepth(3).setDisplaySize(24, 24)
        const baseScale = icon.scaleX
        this.tweens.add({
          targets: icon,
          scaleX: baseScale * 1.5, scaleY: baseScale * 1.5, alpha: 0.5,
          duration: 700 + n * 120, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
        })
        tile.icon = icon
      }
    }

    // ── Health packs ─────────────────────────────────────────────────────────
    this.healthPacks = this.physics.add.staticGroup()
    for (let i = 0; i < 1 + this.level; i++) {
      let cell, attempts = 0
      do {
        cell = floorCells[Math.floor(Math.random() * floorCells.length)]
        attempts++
      } while (usedCells.has(`${cell.row},${cell.col}`) && attempts < 50)
      usedCells.add(`${cell.row},${cell.col}`)
      this.healthPacks.create(cell.col * TILE + TILE / 2, cell.row * TILE + TILE / 2, 'health').setDepth(2)
    }

    // ── Armor pickups ─────────────────────────────────────────────────────────
    const armorPickupDefs = [
      { groupKey: 'armorSilver', aType: 'silver', texKey: 'armor_silver', count: 25, hpBonus: 10 },
      { groupKey: 'armorGold',   aType: 'gold',   texKey: 'armor_gold',   count: 15, hpBonus: 20 },
      { groupKey: 'armorFuture', aType: 'future', texKey: 'armor_future', count: 10, hpBonus: 40 },
    ]
    for (const def of armorPickupDefs) {
      this[def.groupKey] = this.physics.add.staticGroup()
      for (let n = 0; n < def.count; n++) {
        let cell, attempts = 0
        do {
          cell = floorCells[Math.floor(Math.random() * floorCells.length)]
          attempts++
        } while (usedCells.has(`${cell.row},${cell.col}`) && attempts < 50)
        usedCells.add(`${cell.row},${cell.col}`)
        const ax = cell.col * TILE + TILE / 2
        const ay = cell.row * TILE + TILE / 2
        const box = this[def.groupKey].create(ax, ay, def.texKey).setDepth(2).setDisplaySize(TILE * 1.25, TILE * 1.25)
        box.refreshBody()
        this.tweens.add({
          targets: box, alpha: 0.7,
          duration: 800 + n * 180, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
        })
      }
    }

    this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 30 })

    // ── Overlaps ─────────────────────────────────────────────────────────────
    this.physics.add.overlap(this.player, this.exit, this.onExitReached, null, this)
    this.physics.add.overlap(this.player, this.keyItem, this.onKeyPickup, null, this)
    this.physics.add.overlap(this.player, this.healthPacks, this.onHealthPickup, null, this)
    this.physics.add.overlap(this.bullets, this.monsters, this.onBulletHitMonster, null, this)

    // Enemy projectiles hit player
    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      if (!proj.active) return
      if (proj.acidTrail && proj.acidTrail.active) proj.acidTrail.destroy()
      if (proj.projType === 'poison') {
        this.spawnAcidSplash(proj.x, proj.y)
        player.takeDamage(proj.damage)
        this.showFloatingText(player.x, player.y - 24, `VENENO -${proj.damage}`, '#44ff88')
        this._flashGreen()
      } else if (proj.projType === 'web') {
        player.immobilize(10000)
        this.showFloatingText(player.x, player.y - 24, 'ATRAPADO 10s', '#ddddff')
      } else if (proj.projType === 'normal') {
        player.takeDamage(proj.damage)
        this.showFloatingText(player.x, player.y - 24, `-${proj.damage}`, '#ff4444')
        this._flashRed()
      }
      proj.destroy()
    }, null, this)


    for (const def of armorPickupDefs) {
      this.physics.add.overlap(this.player, this[def.groupKey], (player, box) => {
        this.tweens.killTweensOf(box)
        box.destroy()
        player.pickupArmor(def.aType)
        player.heal(def.hpBonus)
        const s = ARMOR_STATS[def.aType]
        this.showFloatingText(player.x, player.y - 20, `${s.label} +${def.hpBonus}HP`, s.color)
      }, null, this)
    }

    for (const def of weaponDefs) {
      this.physics.add.overlap(this.player, this[def.groupKey], (player, sprite) => {
        if (sprite.icon) { this.tweens.killTweensOf(sprite.icon); sprite.icon.destroy() }
        this.tweens.killTweensOf(sprite)
        sprite.destroy()
        player.pickupWeapon(def.wType)
        this.score += 2
        this.events.emit('scoreChanged', this.score)
        const s = WEAPON_STATS[def.wType]
        this.showFloatingText(player.x, player.y - 20,
          `${s.label}! +2`, this._weaponColor(def.wType))
      }, null, this)
    }

    // ── Camera ───────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setZoom(2)
    this.cameras.main.fadeIn(500)

    this.events.on('playerDied', this.onPlayerDied, this)
    this.events.on('monsterKilled', this.onMonsterKilled, this)

    this.scene.launch('UIScene', {
      health:         this.player.health,
      maxHealth:      this.player.maxHealth,
      level:          this.level,
      score:          this.score,
      lives:          this.lives,
      elapsedMs:      this._elapsedMs,
      armor:          this.player.armor,
      armorMax:       this.player.armorMax,
      armorType:      this.player.armorType,
      mutantCount:       this.mutantCount,
      serpienteCount:    this.serpienteCount,
      araniaCount:       this.araniaCount,
      t700Count:         this.t700Count,
      killMachineCount:  this.killMachineCount,
      exterminadorCount: this.exterminadorCount,
    })

    // ── Música nivel 1 ───────────────────────────────────────────────────────
    this._bgMusic = null
    if (this.level === 1 && this.cache.audio.exists('musica_nivel_1')) {
      this._bgMusic = this.sound.add('musica_nivel_1', { loop: true, volume: 0.25 })
      this._bgMusic.play()
    }
    this.events.once('shutdown', () => {
      this.sound.stopAll()
    })

    // ── Info panel state ──────────────────────────────────────────────────────
    this._infoPanel = null
    this._panelClickZones = []

    this.input.on('pointerdown', (pointer) => {
      const cam = this.cameras.main
      const wx = cam.scrollX + pointer.x / cam.zoom
      const wy = cam.scrollY + pointer.y / cam.zoom

      // Check weapon-selection zones inside player panel
      for (const zone of this._panelClickZones) {
        if (wx >= zone.xMin && wx <= zone.xMax && wy >= zone.yMin && wy <= zone.yMax) {
          this.player.selectWeapon(zone.weaponType)
          this.showPlayerPanel(this.player)
          return
        }
      }

      // Check player
      if (Phaser.Math.Distance.Between(wx, wy, this.player.x, this.player.y) < TILE * 1.2) {
        this.showPlayerPanel(this.player)
        return
      }

      // Check monsters
      for (const m of this.monsters.getChildren()) {
        if (!m.active) continue
        if (Phaser.Math.Distance.Between(wx, wy, m.x, m.y) < TILE * 0.8) {
          this.showInfoPanel(m.x, m.y, m.getInfoLines())
          return
        }
      }
    })

    this.addVignette()

    // ── Pause ─────────────────────────────────────────────────────────────────
    this._paused = false
    this._pauseOverlay = null
    this._pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // ── Weapon menu ───────────────────────────────────────────────────────────
    this._weaponMenuOpen  = false
    this._weaponMenuOverlay = null
    this._weaponMenuItems = []
    this._weaponMenuIndex = 0
    this._enterKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this._menuUpKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    this._menuDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    this._escKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    // Timer (continues from previous level/life)
    this._lastEmittedSec = Math.floor(this._elapsedMs / 1000) - 1
  }

  _weaponColor(type) {
    return { sword: '#ffdd44', arrow: '#88ddff', shotgun: '#ff8833', future: '#00ffff' }[type] || '#ffffff'
  }

  addVignette() {
    const w = this.scale.width
    const h = this.scale.height
    const v = this.add.graphics()
    v.setScrollFactor(0).setDepth(100)
    v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0.7, 0, 0); v.fillRect(0, 0, w / 3, h)
    v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.7, 0.7); v.fillRect((w * 2) / 3, 0, w / 3, h)
    v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0, 0, 0.7); v.fillRect(0, 0, w, h / 3)
    v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.7, 0.7, 0); v.fillRect(0, (h * 2) / 3, w, h / 3)
  }

  update(time, delta) {
    if (this._weaponMenuOpen) {
      const n = this._weaponMenuItems.length
      if (n > 0) {
        if (Phaser.Input.Keyboard.JustDown(this._menuUpKey)) {
          this._weaponMenuIndex = (this._weaponMenuIndex - 1 + n) % n
          this._refreshWeaponMenu()
        }
        if (Phaser.Input.Keyboard.JustDown(this._menuDownKey)) {
          this._weaponMenuIndex = (this._weaponMenuIndex + 1) % n
          this._refreshWeaponMenu()
        }
        if (Phaser.Input.Keyboard.JustDown(this._enterKey)) {
          this.player.selectWeapon(this._weaponMenuItems[this._weaponMenuIndex].type)
          this._closeWeaponMenu()
          return
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this._pauseKey)) this._closeWeaponMenu()
      return
    }
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) { this._exitToMenu(); return }
    if (Phaser.Input.Keyboard.JustDown(this._pauseKey)) this._togglePause()
    if (Phaser.Input.Keyboard.JustDown(this._enterKey)) this._openWeaponMenu()
    if (this._paused || !this.player.active) return
    this._elapsedMs += delta
    const secs = Math.floor(this._elapsedMs / 1000)
    if (secs !== this._lastEmittedSec) {
      this._lastEmittedSec = secs
      this.events.emit('timerUpdate', secs)
    }
    this.player.update(time, this.bullets)
    this.monsters.getChildren().forEach(m => m.update(time, this.player))
    this.bullets.getChildren().forEach(b => { b.lifespan -= 16; if (b.lifespan <= 0) b.destroy() })
  }

  _openWeaponMenu() {
    if (this.player.inventory.size === 0) {
      this.showFloatingText(this.player.x, this.player.y - 30, 'SIN ARMAS', '#ff4444')
      return
    }
    this._weaponMenuOpen = true
    this.physics.pause()
    this.tweens.pauseAll()

    const weapons = [...this.player.inventory.entries()]
    const activeIdx = weapons.findIndex(([t]) => t === this.player.activeWeapon)
    this._weaponMenuIndex = activeIdx >= 0 ? activeIdx : 0

    const w = this.scale.width, h = this.scale.height
    const itemH = 38
    const menuH = 80 + weapons.length * itemH + 36
    const menuW = 290
    const mx = w / 2, my = h / 2

    const objs = []
    const bg = this.add.graphics().setScrollFactor(0).setDepth(600)
    bg.fillStyle(0x000000, 0.82); bg.fillRect(0, 0, w, h)
    bg.fillStyle(0x002218, 1)
    bg.fillRoundedRect(mx - menuW / 2, my - menuH / 2, menuW, menuH, 8)
    bg.lineStyle(2, 0x00ff88, 1)
    bg.strokeRoundedRect(mx - menuW / 2, my - menuH / 2, menuW, menuH, 8)
    objs.push(bg)

    objs.push(
      this.add.text(mx, my - menuH / 2 + 22, 'SELECCIONAR ARMA', {
        fontFamily: 'Courier New', fontSize: '16px', color: '#00ff88',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(601)
    )

    const startY = my - menuH / 2 + 62
    this._weaponMenuItems = weapons.map(([type, ammo], i) => {
      const stats = WEAPON_STATS[type]
      const ammoStr = ammo === -1 ? '∞' : `x${ammo}`
      const textObj = this.add.text(mx, startY + i * itemH, '', {
        fontFamily: 'Courier New', fontSize: '15px',
        stroke: '#000000', strokeThickness: 2, padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(601)
      objs.push(textObj)
      return { type, stats, ammoStr, textObj }
    })

    objs.push(
      this.add.text(mx, my + menuH / 2 - 16, '↑↓ navegar   ENTER confirmar   ESPACIO cancelar', {
        fontFamily: 'Courier New', fontSize: '9px', color: '#336633',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(601)
    )

    this._weaponMenuOverlay = objs
    this._refreshWeaponMenu()
  }

  _refreshWeaponMenu() {
    this._weaponMenuItems.forEach(({ stats, ammoStr, textObj }, i) => {
      const sel = i === this._weaponMenuIndex
      textObj.setText(`${sel ? '▶  ' : '    '}${stats.label}   ${stats.dmg} dmg   ${ammoStr}`)
      textObj.setStyle({ color: sel ? '#ffff00' : '#88cc88' })
    })
  }

  _closeWeaponMenu() {
    this._weaponMenuOpen = false
    if (this._weaponMenuOverlay) {
      this._weaponMenuOverlay.forEach(o => o.destroy())
      this._weaponMenuOverlay = null
    }
    this._weaponMenuItems = []
    this.physics.resume()
    this.tweens.resumeAll()
  }

  _togglePause() {
    this._paused = !this._paused
    if (this._paused) {
      this.physics.pause()
      this.tweens.pauseAll()
      this.sound.pauseAll()
      const w = this.scale.width, h = this.scale.height
      this._pauseOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(500)
      const bg = this.add.graphics()
      bg.fillStyle(0x000000, 0.72); bg.fillRect(0, 0, w, h)
      const title = this.add.text(w / 2, h / 2 - 24, '⏸  PAUSA', {
        fontFamily: 'Courier New', fontSize: '36px', color: '#00ff88',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5)
      const hint = this.add.text(w / 2, h / 2 + 28, 'ESPACIO para continuar', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#888888',
      }).setOrigin(0.5)
      this._pauseOverlay.add([bg, title, hint])
    } else {
      this._pauseOverlay?.destroy()
      this._pauseOverlay = null
      this.physics.resume()
      this.tweens.resumeAll()
      this.sound.resumeAll()
    }
  }

  // ── Callbacks ─────────────────────────────────────────────────────────────

  onKeyPickup(player, key) {
    if (!key.active) return
    key.destroy()
    player.hasKey = true
    this.events.emit('keyPickedUp')

    // Unlock exit: switch to green glow
    this.exit.clearTint()
    this.tweens.killTweensOf(this.exit)
    this.tweens.add({
      targets: this.exit, alpha: 0.5, scaleX: 1.15, scaleY: 1.15,
      duration: 900, yoyo: true, repeat: 8, ease: 'Sine.easeInOut',
    })
    this.exitRing.clear()
    this.exitRing.fillStyle(0x00ff66, 0.18)
    const ex = this.exit.x, ey = this.exit.y
    this.exitRing.fillCircle(ex, ey, TILE * 2)

    this.showFloatingText(player.x, player.y - 30, '¡LLAVE ENCONTRADA!', '#ffdd00')
    this.cameras.main.shake(200, 0.007)
  }

  onExitReached() {
    if (!this.player.hasKey) {
      if (!this._keyWarningCooldown) {
        this._keyWarningCooldown = true
        this.showFloatingText(this.player.x, this.player.y - 30, '¡NECESITÁS LA LLAVE!', '#ff4444')
        this.time.delayedCall(2000, () => { this._keyWarningCooldown = false })
      }
      return
    }
    this.score += 500
    this.showFloatingText(this.player.x, this.player.y - 30, '+500 SALIDA!', '#00ff88')
    this.events.emit('scoreChanged', this.score)
    this.cameras.main.fadeOut(900, 0, 255, 100)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene')
      this.scene.start('GameScene', {
        level: this.level + 1, score: this.score,
        lives: this.lives, elapsedMs: this._elapsedMs,
        inventory: [...this.player.inventory.entries()],
        activeWeapon: this.player.activeWeapon,
        savedArmor: this.player.armorType
          ? { type: this.player.armorType, armor: this.player.armor, armorMax: this.player.armorMax }
          : null,
      })
    })
  }

  _exitToMenu() {
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene')
      this.scene.start('MenuScene')
    })
  }

  onHealthPickup(player, pack) {
    pack.destroy()
    player.pickupHealth(5)
    this.showFloatingText(player.x, player.y - 20, '+5 MAX HP', '#ff4444')
  }

  onBulletHitMonster(bullet, monster) {
    this.spawnHitParticle(bullet.x, bullet.y)
    const dmg = bullet.damage || 1
    bullet.destroy()
    const killed = monster.hit(dmg)
    if (killed) {
      const pts = monster.scoreValue || 10
      this.score += pts
      this.showFloatingText(monster.x, monster.y - 20, `+${pts}`, '#ffff00')
      this.events.emit('scoreChanged', this.score)
    } else {
      this.showFloatingText(monster.x, monster.y - 16, `-${dmg}`, '#88ccff')
    }
  }

  onPlayerDied() {
    this.lives -= 1
    this.events.emit('livesChanged', this.lives)
    this.cameras.main.shake(500, 0.02)
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(800, 150, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('UIScene')
        if (this.lives <= 0) {
          this.scene.start('GameOverScene', { score: this.score, level: this.level })
        } else {
          this.scene.start('GameScene', {
            level: this.level, score: this.score,
            lives: this.lives, elapsedMs: this._elapsedMs,
          })
        }
      })
    })
  }

  onMonsterKilled(m) {
    if      (m.monsterType === 'mutant')       this.mutantCount       = Math.max(0, this.mutantCount       - 1)
    else if (m.monsterType === 'serpiente')    this.serpienteCount    = Math.max(0, this.serpienteCount    - 1)
    else if (m.monsterType === 'arania')       this.araniaCount       = Math.max(0, this.araniaCount       - 1)
    else if (m.monsterType === 'robot')        this.t700Count         = Math.max(0, this.t700Count         - 1)
    else if (m.monsterType === 'killmachine')  this.killMachineCount  = Math.max(0, this.killMachineCount  - 1)
    else if (m.monsterType === 'exterminador') this.exterminadorCount = Math.max(0, this.exterminadorCount - 1)
    this.events.emit('monsterCountChanged', {
      mutant:       this.mutantCount,
      serpiente:    this.serpienteCount,
      arania:       this.araniaCount,
      t700:         this.t700Count,
      killMachine:  this.killMachineCount,
      exterminador: this.exterminadorCount,
    })
  }

  // ── Info panels ───────────────────────────────────────────────────────────

  _clearPanel() {
    if (this._infoPanel) {
      this._infoPanel.forEach(o => { if (o.active) o.destroy() })
      this._infoPanel = null
    }
    this._panelClickZones = []
  }

  // Generic info panel (monsters, etc.) — uses two rects for border, no stroke
  showInfoPanel(worldX, worldY, lines) {
    this._clearPanel()

    const padding = 6, lineH = 14
    const panelW = 140, panelH = padding * 2 + lines.length * lineH
    const px = worldX - panelW / 2
    const py = worldY - panelH - 22
    const cx = worldX, cy = py + panelH / 2

    const objs = [
      this.add.rectangle(cx, cy, panelW + 2, panelH + 2, 0x00ff44).setDepth(299),
      this.add.rectangle(cx, cy, panelW,     panelH,     0x000000).setDepth(300),
    ]
    lines.forEach((line, i) =>
      objs.push(
        this.add.text(px + padding, py + padding + i * lineH, line, {
          fontSize: i === 0 ? '10px' : '9px',
          fontFamily: 'Courier New',
          color: i === 0 ? '#00ff88' : '#00ee44',
        }).setDepth(301)
      )
    )
    this._infoPanel = objs
    this.time.delayedCall(4000, () => { if (this._infoPanel === objs) this._clearPanel() })
  }

  // Player panel — shows inventory + clickable weapon selection
  showPlayerPanel(player) {
    this._clearPanel()

    const padding = 6, lineH = 14
    const panelW = 160
    const weapons = [...player.inventory.entries()].map(([type, ammo]) => ({
      type, ammo, active: type === player.activeWeapon,
      label: WEAPON_STATS[type].label, dmg: WEAPON_STATS[type].dmg,
    }))

    const armorLine = player.armorType
      ? `ESCUDO: ${Math.ceil(player.armor)}/${player.armorMax}${player.damageMultiplier > 1 ? ` DMGx${player.damageMultiplier}` : ''}`
      : null
    const headerLines = [
      '[ PERSONAJE ]',
      `HP: ${Math.ceil(player.health)} / ${player.maxHealth}`,
      ...(armorLine ? [armorLine] : []),
      weapons.length > 0 ? '─── ARMAS ───' : 'SIN ARMAS',
    ]
    const totalLines = headerLines.length + weapons.length +
      (weapons.length > 0 ? 1 : 0) // hint line
    const panelH = padding * 2 + totalLines * lineH
    const px = player.x - panelW / 2
    const py = player.y - panelH - 25
    const cx = player.x, cy = py + panelH / 2

    const objs = [
      this.add.rectangle(cx, cy, panelW + 2, panelH + 2, 0x00ff44).setDepth(299),
      this.add.rectangle(cx, cy, panelW,     panelH,     0x000000).setDepth(300),
    ]

    const zones = []

    headerLines.forEach((line, i) =>
      objs.push(
        this.add.text(px + padding, py + padding + i * lineH, line, {
          fontSize: i === 0 ? '10px' : '9px',
          fontFamily: 'Courier New',
          color: i === 0 ? '#00ff88' : '#88ee88',
        }).setDepth(301)
      )
    )

    weapons.forEach((w, i) => {
      const lineY = py + padding + (headerLines.length + i) * lineH
      const ammoStr = w.ammo === -1 ? '∞' : `x${w.ammo}`
      const prefix = w.active ? '▶' : '  '
      const txt = this.add.text(
        px + padding, lineY,
        `${prefix} ${w.label}  ${w.dmg}dmg  ${ammoStr}`,
        {
          fontSize: '9px', fontFamily: 'Courier New',
          color: w.active ? '#ffffff' : '#88cc88',
        }
      ).setDepth(301)
      objs.push(txt)

      zones.push({ xMin: px, xMax: px + panelW, yMin: lineY, yMax: lineY + lineH, weaponType: w.type })
    })

    if (weapons.length > 0) {
      const hintY = py + padding + (headerLines.length + weapons.length) * lineH
      objs.push(
        this.add.text(px + padding, hintY, 'toca arma para equipar', {
          fontSize: '8px', fontFamily: 'Courier New', color: '#448844',
        }).setDepth(301)
      )
    }

    this._infoPanel = objs
    this._panelClickZones = zones
    this.time.delayedCall(7000, () => { if (this._infoPanel === objs) this._clearPanel() })
  }

  // ── Effects ───────────────────────────────────────────────────────────────

  // Snap velocity to nearest cardinal direction (←→↑↓)
  _cardinalVelocity(fromX, fromY, toX, toY, speed) {
    const dx = toX - fromX, dy = toY - fromY
    if (Math.abs(dx) >= Math.abs(dy)) return { vx: dx >= 0 ? speed : -speed, vy: 0 }
    return { vx: 0, vy: dy >= 0 ? speed : -speed }
  }

  spawnPoisonBullet(fromX, fromY, toX, toY, damage, speed = 340) {
    const proj = this.physics.add.image(fromX, fromY, 'poison_bullet')
    proj.setDisplaySize(20, 20).setDepth(12)
    proj.projType = 'poison'
    proj.damage   = damage
    const angle = Math.atan2(toY - fromY, toX - fromX)
    proj.setRotation(angle)
    proj.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
    this.enemyProjectiles.add(proj)

    const trail = this.add.particles(0, 0, 'poison_bullet', {
      follow: proj,
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.75, end: 0 },
      tint: [0x00ff44, 0x44ff00, 0x22dd55],
      lifespan: 280,
      frequency: 45,
    })
    trail.setDepth(11)
    proj.acidTrail = trail

    this.time.delayedCall(2500, () => {
      if (proj.active) proj.destroy()
      if (trail.active) trail.destroy()
    })
  }

  spawnAraniaBullet(fromX, fromY, toX, toY, damage, speed = 420) {
    if (this.enemyProjectiles.getLength() >= 40) return
    const proj = this.physics.add.image(fromX, fromY, 'poison_bullet')
    proj.setDisplaySize(22, 22).setDepth(12).setTint(0xcc44ff)
    proj.projType = 'poison'
    proj.damage   = damage
    const dx = toX - fromX, dy = toY - fromY
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const vx = horizontal ? Math.sign(dx) * speed : 0
    const vy = horizontal ? 0 : Math.sign(dy) * speed
    proj.setRotation(horizontal ? (dx >= 0 ? 0 : Math.PI) : (dy >= 0 ? Math.PI / 2 : -Math.PI / 2))
    this.enemyProjectiles.add(proj)
    proj.body.setVelocity(vx, vy)
    const trail = this.add.particles(0, 0, 'poison_bullet', {
      follow: proj,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xcc44ff, 0x9922cc, 0xff88ff],
      lifespan: 250,
      frequency: 40,
    })
    trail.setDepth(11)
    this.time.delayedCall(2200, () => {
      if (proj.active) proj.destroy()
      if (trail.active) trail.destroy()
    })
  }

  spawnSerpenteBullet(fromX, fromY, toX, toY, damage, speed = 400) {
    if (this.enemyProjectiles.getLength() >= 40) return
    const proj = this.physics.add.image(fromX, fromY, 'poison_bullet')
    proj.setDisplaySize(20, 20).setDepth(12).setTint(0x44ff44)
    proj.projType = 'poison'
    proj.damage   = damage
    const dx = toX - fromX, dy = toY - fromY
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const vx = horizontal ? Math.sign(dx) * speed : 0
    const vy = horizontal ? 0 : Math.sign(dy) * speed
    proj.setRotation(horizontal ? (dx >= 0 ? 0 : Math.PI) : (dy >= 0 ? Math.PI / 2 : -Math.PI / 2))
    this.enemyProjectiles.add(proj)
    proj.body.setVelocity(vx, vy)
    const trail = this.add.particles(0, 0, 'poison_bullet', {
      follow: proj,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x44ff44, 0x22cc22, 0x88ff44],
      lifespan: 250,
      frequency: 40,
    })
    trail.setDepth(11)
    this.time.delayedCall(2200, () => {
      if (proj.active) proj.destroy()
      if (trail.active) trail.destroy()
    })
  }

  spawnRobotBullet(fromX, fromY, vx, vy, damage) {
    if (this.enemyProjectiles.getLength() >= 80) return
    const proj = this.physics.add.image(fromX, fromY, 'bullet')
    proj.setDisplaySize(10, 10).setDepth(12).setTint(0x4488ff)
    proj.projType = 'normal'
    proj.damage = damage
    proj.body.setVelocity(vx, vy)
    this.enemyProjectiles.add(proj)
    this.time.delayedCall(1800, () => { if (proj.active) proj.destroy() })
  }

  spawnAcidSplash(x, y) {
    const p = this.add.particles(x, y, 'poison_bullet', {
      speed: { min: 40, max: 130 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      tint: [0x00ff44, 0x44ff00, 0x88ff22, 0x22ee55],
      lifespan: 450,
      quantity: 12,
      emitting: false,
    })
    p.explode(12)
    this.time.delayedCall(600, () => p.destroy())
  }

  spawnWeb(fromX, fromY, toX, toY) {
    if (this.enemyProjectiles.getLength() >= 40) return
    const proj = this.physics.add.image(fromX, fromY, 'web_bullet')
    proj.setDisplaySize(12, 12).setDepth(12)
    proj.projType = 'web'
    const { vx, vy } = this._cardinalVelocity(fromX, fromY, toX, toY, 130)
    proj.body.setVelocity(vx, vy)
    this.enemyProjectiles.add(proj)
    this.time.delayedCall(2000, () => { if (proj.active) proj.destroy() })
  }

  _flashRed() {
    const w = this.scale.width, h = this.scale.height
    const flash = this.add.rectangle(w / 2, h / 2, w, h, 0xff2200, 0.22)
      .setScrollFactor(0).setDepth(150)
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() })
  }

  _flashGreen() {
    const w = this.scale.width, h = this.scale.height
    const flash = this.add.rectangle(w / 2, h / 2, w, h, 0x00ff44, 0.22)
      .setScrollFactor(0).setDepth(150)
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() })
  }

  spawnHitParticle(x, y) {
    const p = this.add.particles(x, y, 'bullet', {
      speed: { min: 30, max: 80 }, angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 }, tint: 0xffff88,
      lifespan: 200, quantity: 4, emitting: false,
    })
    p.explode(4)
    this.time.delayedCall(300, () => p.destroy())
  }

  showFloatingText(x, y, text, color) {
    const txt = this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'Courier New',
      color, stroke: '#000000', strokeThickness: 3,
    }).setDepth(200).setOrigin(0.5)
    this.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 800, onComplete: () => txt.destroy() })
  }
}
