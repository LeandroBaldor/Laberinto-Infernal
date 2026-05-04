const TILE = 32

export const WEAPON_STATS = {
  sword:         { label: 'ESPADA',         dmg: 5,   ranged: false, ammoPerPickup: 20, speed: 0,   tint: null,     cooldown: 600 },
  arrow:         { label: 'FLECHAS',        dmg: 2.5, ranged: true,  ammoPerPickup: 8,  speed: 400, tint: null,     cooldown: 400 },
  shotgun:       { label: 'ESCOPETA',       dmg: 10,  ranged: true,  ammoPerPickup: 5,  speed: 350, tint: 0xff6600, cooldown: 500 },
  future:        { label: 'ARG.FUTURO',     dmg: 15,  ranged: true,  ammoPerPickup: 4,  speed: 620, tint: 0x00ddff, cooldown: 350 },
  ametralladora: { label: 'AMETRALLADORA',  dmg: 8,   ranged: true,  ammoPerPickup: 30, speed: 500, tint: 0xffcc00, cooldown: 150 },
  lanzallamas:   { label: 'LANZALLAMAS',    dmg: 40,  ranged: true,  ammoPerPickup: 10, speed: 220, tint: 0xff4400, cooldown: 2000 },
}

export const ARMOR_STATS = {
  silver: { label: 'ARMADURA PLATEADA',  armorMax: 50,  dmgMult: 1, ammoMult: 1, color: '#aaaacc' },
  gold:   { label: 'ARMADURA DORADA',    armorMax: 100, dmgMult: 1, ammoMult: 1, color: '#ffcc00' },
  future: { label: 'ARMADURA FUTURISTA', armorMax: 200, dmgMult: 2, ammoMult: 2, color: '#00ddff' },
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDisplaySize(TILE * 2.8125, TILE * 2.8125)
    this.body.setSize(TILE, TILE)
    this.setDepth(10)

    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY
    this._stepCount  = 0

    this.gridCol = Math.round((x - TILE / 2) / TILE)
    this.gridRow = Math.round((y - TILE / 2) / TILE)
    this.moving = false

    this.health = 100
    this.maxHealth = 100
    this.inventory = new Map()   // weaponType → ammo (-1 = unlimited)
    this.activeWeapon = null
    this.invincible = false
    this.facingLeft = false
    this.facingDir  = 'right'   // 'right' | 'left' | 'up' | 'down'
    this.immobileUntil = 0

    this.hasKey = false

    this.armor = 0
    this.armorMax = 0
    this.armorType = null
    this.damageMultiplier = 1
    this.ammoMultiplier = 1

    this.cursors = scene.input.keyboard.createCursorKeys()
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })
    this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.lastShot = 0
    this.shootCooldown = 400

    this._repeatDelay    = 210   // ms after first press before auto-repeat starts
    this._repeatInterval = 115   // ms between repeated steps while held
    this._nextMoveTime   = Infinity
    this._heldDc = 0
    this._heldDr = 0

    this._lanzallamasFiring = false
    this._lanzallamasFiringTimer = null
  }

  // ── compat getters so GameScene / UIScene still work ──────────────────────
  get weaponType() { return this.activeWeapon }
  get hasWeapon()  { return this.activeWeapon !== null }
  get ammo() {
    if (!this.activeWeapon) return 0
    const a = this.inventory.get(this.activeWeapon)
    return a === -1 ? '∞' : a
  }

  // ── inventory ─────────────────────────────────────────────────────────────
  pickupWeapon(type) {
    const stats = WEAPON_STATS[type]
    if (this.inventory.has(type)) {
      if (stats.ammoPerPickup > 0) {
        const bonus = Math.round(stats.ammoPerPickup * this.ammoMultiplier)
        this.inventory.set(type, this.inventory.get(type) + bonus)
      }
    } else {
      const initialAmmo = stats.ammoPerPickup === -1 ? -1 : Math.round(stats.ammoPerPickup * this.ammoMultiplier)
      this.inventory.set(type, initialAmmo)
    }
    if (!this.activeWeapon) this.activeWeapon = type
    this._emitWeaponState()
    this._playPickupSound()
  }

  pickupArmor(type) {
    const stats = ARMOR_STATS[type]
    this.armorType = type
    this.armorMax = stats.armorMax
    this.armor = stats.armorMax
    this.damageMultiplier = stats.dmgMult
    this.ammoMultiplier = stats.ammoMult
    this.scene.events.emit('armorChanged', this.armor, this.armorMax, this.armorType)
    this._updateSprite()
    this._playPickupSound()
  }

  _playPickupSound() {
    if (this.scene.cache.audio.exists('sonido_pickup')) {
      this.scene.sound.play('sonido_pickup', { volume: 0.7 })
    }
  }

  immobilize(duration) {
    this.immobileUntil = this.scene.time.now + duration
    this.setTint(0xbbbbff)
    this.scene.time.delayedCall(duration, () => {
      if (this.active) {
        this.immobileUntil = 0
        this.clearTint()
      }
    })
  }

  selectWeapon(type) {
    if (!this.inventory.has(type)) return
    this.activeWeapon = type
    this._emitWeaponState()
  }

  _emitWeaponState() {
    this.scene.events.emit('weaponChanged', this.activeWeapon)
    this.scene.events.emit('ammoChanged', this.ammo)
    this._updateSprite()
  }

  _updateSprite() {
    const lanzaKey = this._lanzallamasFiring && this.scene.textures.exists('player_lanzallamas_disparo')
      ? 'player_lanzallamas_disparo' : 'player_lanzallamas'
    const weaponMap = {
      sword: 'player_sword', arrow: 'player_arrow', shotgun: 'player_shotgun',
      future: 'player_future', ametralladora: 'player_ametralladora', lanzallamas: lanzaKey,
    }
    let key = 'player'
    if (this.armorType) {
      const weaponSuffix = this.activeWeapon || 'none'
      const candidate = `player_${this.armorType}_${weaponSuffix}`
      if (this.scene.textures.exists(candidate)) {
        key = candidate
      } else {
        const variant = this.activeWeapon && weaponMap[this.activeWeapon]
        if (variant && this.scene.textures.exists(variant)) key = variant
      }
    } else {
      const variant = this.activeWeapon && weaponMap[this.activeWeapon]
      if (variant && this.scene.textures.exists(variant)) key = variant
    }
    if (this.texture.key !== key) this.setTexture(key)
    const targetH = TILE * 2.1
    const src = this.scene.textures.get(key).getSourceImage()
    const s = src.height > 0 ? targetH / src.height : targetH / 256
    this.setScale(s)
    this._baseScaleX = this.scaleX
    this._baseScaleY = this.scaleY
  }

  // ── movement ──────────────────────────────────────────────────────────────
  canMoveTo(col, row) {
    const grid = this.scene.mazeGrid
    if (!grid || row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false
    return grid[row][col] === 0
  }

  stepTo(col, row) {
    if (this.moving) return
    if (!this.canMoveTo(col, row)) return
    this.moving = true
    this.gridCol = col
    this.gridRow = row
    const tx = col * TILE + TILE / 2
    const ty = row * TILE + TILE / 2

    this._footstepSound?.play()

    // Alternating lean: odd steps tilt right, even steps tilt left
    this._stepCount++
    const lean = (this._stepCount % 2 === 0) ? -8 : 8
    const baseAngle = this.angle

    this.scene.tweens.add({
      targets: this,
      angle: baseAngle + lean,
      duration: 55,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          angle: baseAngle,
          duration: 60,
          ease: 'Sine.easeOut',
        })
      },
    })

    this.scene.tweens.add({
      targets: this, x: tx, y: ty, duration: 110, ease: 'Linear',
      onComplete: () => { this.moving = false; this.body.reset(tx, ty) },
    })
  }

  update(time, bullets) {
    if (time < this.immobileUntil) return

    const { cursors, wasd } = this

    // Resolve current held direction (priority: left > right > up > down)
    let dc = 0, dr = 0
    if      (cursors.left.isDown  || wasd.left.isDown)  { dc = -1; this.facingLeft = true;  this.facingDir = 'left'  }
    else if (cursors.right.isDown || wasd.right.isDown) { dc =  1; this.facingLeft = false; this.facingDir = 'right' }
    else if (cursors.up.isDown    || wasd.up.isDown)    { dr = -1; this.facingLeft = false; this.facingDir = 'up'   }
    else if (cursors.down.isDown  || wasd.down.isDown)  { dr =  1; this.facingLeft = false; this.facingDir = 'down' }

    const dirChanged = dc !== this._heldDc || dr !== this._heldDr
    this._heldDc = dc; this._heldDr = dr

    if (dc !== 0 || dr !== 0 || dirChanged) {
      if      (this.facingDir === 'up')   this.setAngle(-90)
      else if (this.facingDir === 'down') this.setAngle(90)
      else                                this.setAngle(0)
    }

    if (!this.moving && (dc !== 0 || dr !== 0)) {
      if (dirChanged) {
        // Fresh press or direction change: move immediately, schedule repeat
        this.setFlipX(this.facingLeft)
        this.stepTo(this.gridCol + dc, this.gridRow + dr)
        this._nextMoveTime = time + this._repeatDelay
      } else if (time >= this._nextMoveTime) {
        // Auto-repeat while held
        this.setFlipX(this.facingLeft)
        this.stepTo(this.gridCol + dc, this.gridRow + dr)
        this._nextMoveTime = time + this._repeatInterval
      }
    }
    if (dc === 0 && dr === 0) {
      this._nextMoveTime = Infinity
      if (this._footstepSound?.isPlaying) this._footstepSound.stop()
    }

    const cd = (this.activeWeapon && WEAPON_STATS[this.activeWeapon]?.cooldown) || this.shootCooldown
    const shootFired = this.activeWeapon === 'ametralladora'
      ? this.shootKey.isDown
      : Phaser.Input.Keyboard.JustDown(this.shootKey)
    if (shootFired && time > this.lastShot + cd) {
      if (this.activeWeapon === 'sword') {
        this._swordAttack()
        this.lastShot = time
      } else if (this.activeWeapon) {
        const ammo = this.inventory.get(this.activeWeapon)
        if (ammo !== 0) { this.shoot(bullets); this.lastShot = time }
      }
    }
  }

  // ── combat ────────────────────────────────────────────────────────────────
  _swordAttack() {
    const dmg = WEAPON_STATS.sword.dmg * this.damageMultiplier

    // Consume 1 use
    const currentAmmo = this.inventory.get('sword')
    const newAmmo = currentAmmo - 1
    this.inventory.set('sword', newAmmo)
    this.scene.events.emit('ammoChanged', newAmmo)
    if (newAmmo <= 0) {
      this.inventory.delete('sword')
      const remaining = [...this.inventory.keys()]
      this.activeWeapon = remaining.length > 0 ? remaining[0] : null
      this._emitWeaponState()
    }

    // Slash visual effect
    this._showSlashEffect()

    this.scene.tweens.add({ targets: this, alpha: 0.6, duration: 80, yoyo: true })
    if (this.scene.cache.audio.exists('sonidos_arma_espada'))
      this.scene.sound.play('sonidos_arma_espada', { volume: 0.7 })

    const swordReach = TILE * 1.5
    let hitAny = false
    for (const m of this.scene.monsters.getChildren()) {
      if (!m.active) continue
      const b = m.body
      const closestX = Math.max(b.x, Math.min(this.x, b.x + b.width))
      const closestY = Math.max(b.y, Math.min(this.y, b.y + b.height))
      if (Math.hypot(closestX - this.x, closestY - this.y) <= swordReach) {
        hitAny = true
        const killed = m.hit(dmg)
        if (killed) {
          const pts = m.scoreValue || 10
          this.scene.score += pts
          this.scene.showFloatingText(m.x, m.y - 20, `+${pts}`, '#ffff00')
          this.scene.events.emit('scoreChanged', this.scene.score)
        } else {
          this.scene.showFloatingText(m.x, m.y - 16, `-${dmg}`, '#ffaa00')
        }
      }
    }
    if (!hitAny) this.scene.showFloatingText(this.x, this.y - 20, 'ESPADA!', '#ffdd88')
  }

  _showSlashEffect() {
    const dirAngles  = { right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 }
    const dirDegrees = { right: 0, left: 180, up: -90, down: 90 }
    const angle = dirAngles[this.facingDir] ?? 0
    const reach = TILE * 1.8

    // Lunge: cuerpo salta hacia adelante y vuelve
    const lx = this.x + Math.cos(angle) * TILE * 0.6
    const ly = this.y + Math.sin(angle) * TILE * 0.6
    this.scene.tweens.add({
      targets: this, x: lx, y: ly,
      duration: 60, ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => { if (this.body && this.active) this.body.reset(this.x, this.y) },
    })

    // Rotación del cuerpo: giro rápido en dirección del ataque
    const swing = dirDegrees[this.facingDir] ?? 0
    this.scene.tweens.add({
      targets: this, angle: swing + 30,
      duration: 70, ease: 'Sine.easeIn', yoyo: true,
    })

    // Ícono de espada que aparece en el punto de impacto y desaparece
    if (this.scene.textures.exists('sword')) {
      const sx = this.x + Math.cos(angle) * reach
      const sy = this.y + Math.sin(angle) * reach
      const swordIcon = this.scene.add.image(sx, sy, 'sword')
        .setDisplaySize(TILE * 1.4, TILE * 1.4)
        .setAngle(dirDegrees[this.facingDir] + 45)
        .setDepth(20)
        .setAlpha(1)
      this.scene.tweens.add({
        targets: swordIcon, alpha: 0, scaleX: 1.4, scaleY: 1.4,
        duration: 200, ease: 'Quad.easeOut',
        onComplete: () => swordIcon.destroy(),
      })
    }

    // Flash blanco alrededor del jugador
    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 50, yoyo: true,
    })
  }

  shoot(bullets) {
    const stats = WEAPON_STATS[this.activeWeapon]
    const speed = stats.speed
    const dirMap = {
      right: { vx:  speed, vy: 0 },
      left:  { vx: -speed, vy: 0 },
      up:    { vx: 0, vy: -speed },
      down:  { vx: 0, vy:  speed },
    }
    const { vx, vy } = dirMap[this.facingDir] || dirMap.right
    const b = bullets.create(this.x, this.y, 'bullet')
    if (!b) return
    b.setDepth(9)
    b.setVelocity(vx, vy)
    b.damage = stats.dmg * this.damageMultiplier
    if (stats.tint) b.setTint(stats.tint)
    if (this.activeWeapon === 'shotgun')       { b.setScale(1.6); b.lifespan = 1500 }
    else if (this.activeWeapon === 'lanzallamas') { b.setScale(3.0); b.lifespan = 380 }
    else b.lifespan = 1500

    if (this.activeWeapon === 'lanzallamas') {
      this._lanzallamasFiring = true
      this._updateSprite()
      if (this._lanzallamasFiringTimer) this._lanzallamasFiringTimer.remove()
      this._lanzallamasFiringTimer = this.scene.time.delayedCall(2000, () => {
        this._lanzallamasFiring = false
        this._lanzallamasFiringTimer = null
        if (this.active) this._updateSprite()
      })
    }

    const _weaponSounds = { arrow: 'sonidos_arma_flecha', shotgun: 'sonidos_arma_escopeta', future: 'sonidos_arma_futuro' }
    const _sndKey = _weaponSounds[this.activeWeapon]
    if (_sndKey && this.scene.cache.audio.exists(_sndKey))
      this.scene.sound.play(_sndKey, { volume: 0.7 })

    const currentAmmo = this.inventory.get(this.activeWeapon)
    const newAmmo = currentAmmo - 1
    this.inventory.set(this.activeWeapon, newAmmo)
    this.scene.events.emit('ammoChanged', newAmmo)

    if (newAmmo <= 0) {
      this.inventory.delete(this.activeWeapon)
      const remaining = [...this.inventory.keys()]
      this.activeWeapon = remaining.length > 0 ? remaining[0] : null
      this._emitWeaponState()
    }
  }

  takeDamage(amount) {
    if (this.invincible) return
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount)
      this.armor -= absorbed
      amount -= absorbed
      this.scene.events.emit('armorChanged', this.armor, this.armorMax, this.armorType)
    }
    this.invincible = true
    if (amount <= 0) {
      // Armor absorbed everything — brief flash, no HP loss
      this.scene.tweens.add({
        targets: this, alpha: 0.5, duration: 80, yoyo: true, repeat: 1,
        onComplete: () => { this.alpha = 1; this.invincible = false },
      })
      return
    }
    this.health -= amount
    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 100, yoyo: true, repeat: 4,
      onComplete: () => { this.alpha = 1; this.invincible = false },
    })
    this.scene.events.emit('healthChanged', this.health)
    if (this.health <= 0) this.scene.events.emit('playerDied')
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth)
    this.scene.events.emit('healthChanged', this.health)
  }

  // legacy methods kept for any remaining callers
  pickupSword()          { this.pickupWeapon('sword') }
  pickupArrow(n = 8)     { this.pickupWeapon('arrow') }
  pickupHealth(amount = 5) {
    this.maxHealth += amount
    this.health += amount
    this.scene.events.emit('maxHealthChanged', this.maxHealth)
    this.scene.events.emit('healthChanged', this.health)
  }

  getInfoLines() {
    const lines = ['[ PERSONAJE ]', `HP: ${Math.ceil(this.health)} / ${this.maxHealth}`, '']
    if (this.armorType) {
      const s = ARMOR_STATS[this.armorType]
      lines.push(s.label)
      lines.push(`ESCUDO: ${Math.ceil(this.armor)} / ${this.armorMax}`)
      if (this.damageMultiplier > 1) lines.push(`DAÑO x${this.damageMultiplier}`)
      lines.push('')
    }
    if (this.inventory.size === 0) {
      lines.push('SIN ARMAS')
    } else {
      lines.push('ARMAS:')
      for (const [type, ammo] of this.inventory) {
        const s = WEAPON_STATS[type]
        const ammoStr = ammo === -1 ? '∞' : `x${ammo}`
        const active = type === this.activeWeapon ? '>' : ' '
        const dmg = s.dmg * this.damageMultiplier
        lines.push(`${active} ${s.label} ${dmg}dmg ${ammoStr}`)
      }
    }
    return lines
  }
}
