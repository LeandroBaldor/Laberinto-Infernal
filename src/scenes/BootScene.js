export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create() {
    const base = import.meta.env.BASE_URL
    this.load.image('player', `${base}personaje_principal.png?t=${Date.now()}`)
    this.load.image('hedge_sheet', `${base}hedge_tiles.png`)
    this.load.image('monster_raw',   `${base}monster.png`)
    this.load.image('serpiente_raw', `${base}serpiente.png`)
    this.load.image('arania_raw',    `${base}arania.png`)

    // Bush wall tiles
    this.load.image('bush_tile_raw',      `${base}bush_tile.png`)
    this.load.image('bush_tile_bomb_raw', `${base}bush_tile_bomb.png`)
    // Floor tile
    this.load.image('floor_tile_raw', `${base}floor_tile.png`)

    // Weapon pickup sprites (floor items)
    this.load.image('pickup_sword_raw',   `${base}espada.png`)
    this.load.image('pickup_arrow_raw',   `${base}flechas.png`)
    this.load.image('pickup_shotgun_raw', `${base}escopeta.png`)
    this.load.image('pickup_future_raw',  `${base}arma_futuro.png`)

    // Player sprites per weapon (cache-bust so updated files always load)
    const _tsp = Date.now()
    this.load.image('player_sword_raw',    `${base}personaje_principal_espada.png?t=${_tsp}`)
    this.load.image('player_arrow_raw',    `${base}personaje_principal_flecha.png?t=${_tsp}`)
    this.load.image('player_shotgun_raw',  `${base}personaje_principal_escopeta.png?t=${_tsp}`)
    this.load.image('player_future_raw',   `${base}personaje_principal_armafuturo.png?t=${_tsp}`)

    this.load.image('robot_raw', `${base}robot.png`)

    // Nivel 2 tiles (cache-bust so updated images always load)
    const _tst = Date.now()
    this.load.image('metalic_floor_raw',   `${base}Nivel_2/metalic_floor.png?t=${_tst}`)
    this.load.image('metalic_tile_raw',    `${base}Nivel_2/metalic_tile.png?t=${_tst}`)
    this.load.image('metalic_tile_2_raw',  `${base}Nivel_2/metalic_tile_2.png?t=${_tst}`)

    // Nivel 2 robots
    this.load.image('robot_t700_raw',     `${base}Nivel_2/robot.png`)
    this.load.image('robot_calavera_raw', `${base}Nivel_2/robot_calavera.png`)
    this.load.image('robot_nave_raw',     `${base}Nivel_2/robot_nave.png`)

    // Nivel 2 armas pickup (nuevos diseños)
    this.load.image('pickup_sword_l2_raw',         `${base}Nivel_2/espada.png`)
    this.load.image('pickup_arrow_l2_raw',         `${base}Nivel_2/flechas.png`)
    this.load.image('pickup_shotgun_l2_raw',       `${base}Nivel_2/escopeta.png`)
    this.load.image('pickup_future_l2_raw',        `${base}Nivel_2/arma_futuro.png`)
    this.load.image('pickup_ametralladora_raw',    `${base}Nivel_2/ametralladora.png`)
    this.load.image('pickup_lanzallamas_raw',      `${base}Nivel_2/lanzallamas.png`)

    // Nivel 2 personaje con ametralladora
    this.load.image('player_ametralladora_raw',        `${base}Nivel_2/personaje_principal_ametralladora.png`)
    this.load.image('player_silver_ametralladora_raw', `${base}Nivel_2/personaje_principal_armadura_plateada_ametralladora.png`)
    this.load.image('player_gold_ametralladora_raw',   `${base}Nivel_2/personaje_principal_armadura_dorada_ametralladora.png`)
    this.load.image('player_future_ametralladora_raw', `${base}Nivel_2/personaje_principal_armadura_futuro_ametralladora.png`)

    // Armor pickup boxes
    this.load.image('armor_silver_raw', `${base}caja_plateada.png`)
    this.load.image('armor_gold_raw',   `${base}caja_oro.png`)
    this.load.image('armor_future_raw', `${base}caja_futuro.png`)

    // Armor player sprites: 3 armors × weapon states
    const _ts = Date.now()
    const _armorDefs = [
      { id: 'silver', es: 'plateada' },
      { id: 'gold',   es: 'dorada'   },
      { id: 'future', es: 'futuro'   },
    ]
    const _armorWeaponDefs = [
      { id: 'sword',   es: 'espada'      },
      { id: 'arrow',   es: 'flecha'      },
      { id: 'shotgun', es: 'escopeta'    },
      { id: 'future',  es: 'arma_futuro' },
    ]
    for (const a of _armorDefs) {
      this.load.image(`player_${a.id}_none_raw`, `${base}personaje_principal_armadura_${a.es}.png?t=${_ts}`)
      for (const w of _armorWeaponDefs) {
        this.load.image(
          `player_${a.id}_${w.id}_raw`,
          `${base}personaje_principal_armadura_${a.es}_${w.es}.png?t=${_ts}`
        )
      }
    }

    // Nivel 2: lanzallamas por armadura (fondo negro, en Nivel_2/)
    this.load.image('player_lanzallamas_raw',        `${base}Nivel_2/personaje_principal_lanzallamas.png?t=${_ts}`)
    this.load.image('player_silver_lanzallamas_raw', `${base}Nivel_2/personaje_principal_armadura_plateada_lanzallamas.png?t=${_ts}`)
    this.load.image('player_gold_lanzallamas_raw',   `${base}Nivel_2/personaje_principal_armadura_dorada_lanzallamas.png?t=${_ts}`)
    this.load.image('player_future_lanzallamas_raw', `${base}Nivel_2/personaje_principal_armadura_futuro_lanzallamas.png?t=${_ts}`)

    this.load.audio('musica_nivel_1',          `${base}musica_nivel_1.mp3`)
    this.load.audio('musica_menu',             `${base}musica_menu.mp3`)
    this.load.audio('musica_boton_menu',       `${base}musica_boton_menu.mp3`)
    this.load.audio('sonidos_pies_protagonista',`${base}sonidos_pies_protagonista.mp3?t=${Date.now()}`)
    this.load.audio('sonido_arana',              `${base}sonido_araña.mp3`)
    this.load.audio('sonido_arana_grito',        `${base}sonido_araña_grito.mp3`)
    this.load.audio('sonidos_serpiente',          `${base}sonidos_serpiente.mp3`)
    this.load.audio('sonidos_serpiente_gritando', `${base}sonidos_serpiente_gritando.mp3`)
    this.load.audio('sonidos_arma_espada',        `${base}sonidos_arma_espada.mp3`)
    this.load.audio('sonidos_arma_flecha',        `${base}sonidos_arma_flecha.mp3`)
    this.load.audio('sonidos_arma_escopeta',      `${base}sonidos_arma_escopeta.mp3`)
    this.load.audio('sonidos_arma_futuro',        `${base}sonidos_arma_futuro.mp3`)
    this.load.audio('sonidos_monster',            `${base}sonidos_monster.mp3`)
    this.load.audio('sonido_pickup',              `${base}sonido_pickup.wav`)

    let monsterLoaded   = false
    let robotLoaded     = false
    let serpienteLoaded = false
    let araniaLoaded    = false
    this.load.on('filecomplete-image-monster_raw',   () => { monsterLoaded   = true })
    this.load.on('filecomplete-image-robot_raw',     () => { robotLoaded     = true })
    this.load.on('filecomplete-image-serpiente_raw', () => { serpienteLoaded = true })
    this.load.on('filecomplete-image-arania_raw',    () => { araniaLoaded    = true })

    const loaded = new Set()
    this.load.on('filecomplete', (key) => loaded.add(key))

    this.load.once('complete', () => {
      this._stripWhiteBackground('player')

      if (monsterLoaded) {
        this._stripBlackBackground('monster_raw', 'monster')
      } else {
        this._makeMonsterFallback()
      }
      if (robotLoaded) {
        this._stripBlackBackground('robot_raw', 'robot')
      } else {
        this._makeRobotFallback()
      }

      if (serpienteLoaded) {
        this._stripBlackBackgroundFloodFill('serpiente_raw', 'serpiente', 25)
      } else {
        this._makeSerpienteFallback()
      }
      if (araniaLoaded) {
        this._stripBlackBackgroundFloodFill('arania_raw', 'arania', 30)
      } else {
        this._makeAraniaFallback()
      }

      this.createTextures()

      // Bush wall tiles
      if (loaded.has('bush_tile_raw'))      this._makeBushWallsFromImage('bush_tile_raw')
      if (loaded.has('bush_tile_bomb_raw')) this._makeSingleWallFromImage('bush_tile_bomb_raw', 'wall_bomb')
      // Floor tile: replace procedural floor textures if image loaded
      if (loaded.has('floor_tile_raw')) this._makeFloorTilesFromImage('floor_tile_raw')

      // Nivel 2 tiles
      if (loaded.has('metalic_floor_raw'))  this._makeMetalFloorTiles('metalic_floor_raw')
      if (loaded.has('metalic_tile_raw'))   this._makeMetalWallTile('metalic_tile_raw',   'wall_l2')
      if (loaded.has('metalic_tile_2_raw')) this._makeMetalWallTile('metalic_tile_2_raw', 'wall_l2_2')

      // Nivel 2 robots (strip white background)
      if (loaded.has('robot_t700_raw'))     this._stripWhiteBackgroundAs('robot_t700_raw',     'robot_t700')
      if (loaded.has('robot_calavera_raw')) this._stripWhiteBackgroundAs('robot_calavera_raw', 'robot_calavera')
      if (loaded.has('robot_nave_raw'))     this._stripWhiteBackgroundAs('robot_nave_raw',     'robot_nave')

      // Weapon pickup sprites — root folder (white bg)
      const pickupPairsWhite = [
        ['pickup_sword_raw',   'sword'],
        ['pickup_arrow_raw',   'arrow'],
        ['pickup_shotgun_raw', 'shotgun'],
        ['pickup_future_raw',  'future_weapon'],
      ]
      for (const [src, dest] of pickupPairsWhite) {
        if (loaded.has(src)) this._stripWhiteBackgroundAs(src, dest)
      }
      // Nivel_2 versions override the above with updated designs (black bg)
      const pickupPairsBlack = [
        ['pickup_sword_l2_raw',       'sword'],
        ['pickup_arrow_l2_raw',       'arrow'],
        ['pickup_shotgun_l2_raw',     'shotgun'],
        ['pickup_future_l2_raw',      'future_weapon'],
        ['pickup_ametralladora_raw',  'ametralladora'],
        ['pickup_lanzallamas_raw',    'lanzallamas'],
      ]
      for (const [src, dest] of pickupPairsBlack) {
        if (loaded.has(src)) this._stripBlackBackgroundFloodFill(src, dest, 25)
      }

      // Nivel 2 personaje con ametralladora y lanzallamas (fondo negro)
      const nivel2Sprites = [
        ['player_ametralladora_raw',        'player_ametralladora'],
        ['player_silver_ametralladora_raw', 'player_silver_ametralladora'],
        ['player_gold_ametralladora_raw',   'player_gold_ametralladora'],
        ['player_future_ametralladora_raw', 'player_future_ametralladora'],
        ['player_lanzallamas_raw',          'player_lanzallamas'],
        ['player_silver_lanzallamas_raw',   'player_silver_lanzallamas'],
        ['player_gold_lanzallamas_raw',     'player_gold_lanzallamas'],
        ['player_future_lanzallamas_raw',   'player_future_lanzallamas'],
      ]
      for (const [src, dest] of nivel2Sprites) {
        if (loaded.has(src)) this._stripBlackBackgroundFloodFill(src, dest, 3)
      }

      // Register player weapon sprites (black background — use flood fill)
      const playerPairs = [
        ['player_sword_raw',   'player_sword'],
        ['player_arrow_raw',   'player_arrow'],
        ['player_shotgun_raw', 'player_shotgun'],
        ['player_future_raw',  'player_future'],
      ]
      for (const [src, dest] of playerPairs) {
        if (loaded.has(src)) this._stripBlackBackgroundFloodFill(src, dest, 3)
      }

      // Armor box pickups
      const armorBoxPairs = [
        ['armor_silver_raw', 'armor_silver'],
        ['armor_gold_raw',   'armor_gold'],
        ['armor_future_raw', 'armor_future'],
      ]
      for (const [src, dest] of armorBoxPairs) {
        if (loaded.has(src)) this._stripWhiteBackgroundAs(src, dest)
      }

      // Armor player sprites
      const armorDefs = [
        { id: 'silver' }, { id: 'gold' }, { id: 'future' },
      ]
      const weaponDefs = [
        { id: 'none' }, { id: 'sword' }, { id: 'arrow' }, { id: 'shotgun' }, { id: 'future' },
      ]
      for (const a of armorDefs) {
        for (const w of weaponDefs) {
          const rawKey  = `player_${a.id}_${w.id}_raw`
          const destKey = `player_${a.id}_${w.id}`
          if (loaded.has(rawKey)) this._stripBlackBackgroundFloodFill(rawKey, destKey, 3)
        }
      }

      this.scene.start('SplashScene')
    })
    this.load.start()
  }

  _stripWhiteBackground(key) {
    const src = this.textures.get(key).getSourceImage()
    const canvas = document.createElement('canvas')
    canvas.width = src.width; canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) d[i + 3] = 0
    }
    ctx.putImageData(img, 0, 0)
    this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
  }

  _stripWhiteBackgroundAs(srcKey, destKey) {
    const src = this.textures.get(srcKey).getSourceImage()
    const canvas = document.createElement('canvas')
    canvas.width = src.width; canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) d[i + 3] = 0
    }
    ctx.putImageData(img, 0, 0)
    this.textures.remove(srcKey)
    if (this.textures.exists(destKey)) this.textures.remove(destKey)
    this.textures.addCanvas(destKey, canvas)
  }

  _stripBlackBackground(srcKey, destKey) {
    const src = this.textures.get(srcKey).getSourceImage()
    const canvas = document.createElement('canvas')
    canvas.width = src.width; canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 15 && d[i + 1] < 15 && d[i + 2] < 15) d[i + 3] = 0
    }
    ctx.putImageData(img, 0, 0)
    this.textures.remove(srcKey)
    this.textures.addCanvas(destKey, canvas)
  }

  // Strict strip: removes only near-pure-black pixels (max channel < threshold).
  _stripPureBlack(srcKey, destKey, threshold = 5) {
    const src = this.textures.get(srcKey).getSourceImage()
    const canvas = document.createElement('canvas')
    canvas.width = src.width; canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (Math.max(d[i], d[i + 1], d[i + 2]) < threshold) d[i + 3] = 0
    }
    ctx.putImageData(img, 0, 0)
    if (this.textures.exists(srcKey)) this.textures.remove(srcKey)
    if (this.textures.exists(destKey)) this.textures.remove(destKey)
    this.textures.addCanvas(destKey, canvas)
  }

  // Flood-fill from image borders: only removes pixels that are both dark AND
  // connected to the edge of the image. Dark interior pixels (spider legs, etc.)
  // surrounded by colored pixels are preserved, no matter how dark they are.
  _stripBlackBackgroundFloodFill(srcKey, destKey, threshold = 30) {
    const src = this.textures.get(srcKey).getSourceImage()
    const w = src.width, h = src.height
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    const img = ctx.getImageData(0, 0, w, h)
    const d = img.data

    const isDark = (idx) => Math.max(d[idx * 4], d[idx * 4 + 1], d[idx * 4 + 2]) < threshold

    const visited = new Uint8Array(w * h)
    const queue = []

    const seed = (idx) => {
      if (!visited[idx] && isDark(idx)) { visited[idx] = 1; queue.push(idx) }
    }

    // Seed from all four borders
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x) }
    for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1) }

    // BFS — expand only through dark-connected pixels
    for (let qi = 0; qi < queue.length; qi++) {
      const idx = queue[qi]
      const x = idx % w, y = (idx / w) | 0
      if (x > 0)     seed(idx - 1)
      if (x < w - 1) seed(idx + 1)
      if (y > 0)     seed(idx - w)
      if (y < h - 1) seed(idx + w)
    }

    // Make only border-connected dark pixels transparent
    for (let i = 0; i < w * h; i++) {
      if (visited[i]) d[i * 4 + 3] = 0
    }

    ctx.putImageData(img, 0, 0)
    if (this.textures.exists(srcKey)) this.textures.remove(srcKey)
    if (this.textures.exists(destKey)) this.textures.remove(destKey)
    this.textures.addCanvas(destKey, canvas)
  }

  createTextures() {
    // Floor (brown dirt paths)
    this._makeFloor()
    this._makeFloor2()
    this._makeFloor3()
    // Wall tiles — extracted from real hedge pixel art sheet (CC0)
    this._makeHedgeWalls()
    // Exit
    this._makeExit()
    // Weapons
    this._makeSword()
    this._makeArrow()
    this._makeShotgun()
    this._makeFutureWeapon()
    // Other
    this._makeSerpienteSegment()
    this._makeBullet()
    this._makePoisonBullet()
    this._makeWebBullet()
    this._makeHealth()
    this._makeWeaponTile()
    this._makeKeyTexture()
    // Armor box fallbacks (overridden by real images later if available)
    this._makeArmorBox('armor_silver', 0x778899, 0xaabbcc, 0xddeeff)
    this._makeArmorBox('armor_gold',   0xaa8800, 0xddbb00, 0xffee55)
    this._makeArmorBox('armor_future', 0x005577, 0x0088bb, 0x00ddff)
    // Monster texture is created in create() before this runs
  }

  // ─── BUSH WALLS from real image ──────────────────────────────────────────

  _makeBushWallsFromImage(rawKey) {
    const src = this.textures.get(rawKey).getSourceImage()
    const DEST = 32
    const wallKeys = [
      'wall', 'wall2', 'wall_tree', 'wall_fire',
      'wall_ruins', 'wall_charred', 'wall_park', 'wall_school', 'wall_bank',
    ]
    // Brightness variations: some tiles notably darker for depth
    const brightness = [1.0, 0.88, 0.70, 0.95, 0.78, 0.58, 0.92, 0.75, 0.62]

    wallKeys.forEach((key, i) => {
      const canvas = document.createElement('canvas')
      canvas.width = DEST; canvas.height = DEST
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, DEST, DEST)

      // Replace near-black pixels with dark green and apply brightness variation
      const b = brightness[i]
      const id = ctx.getImageData(0, 0, DEST, DEST)
      const d = id.data
      for (let p = 0; p < d.length; p += 4) {
        if (d[p] < 25 && d[p + 1] < 25 && d[p + 2] < 25) {
          // Black → dark green matching game background
          d[p] = 13 * b; d[p + 1] = 26 * b; d[p + 2] = 4 * b; d[p + 3] = 255
        } else {
          d[p] = d[p] * b; d[p + 1] = d[p + 1] * b; d[p + 2] = d[p + 2] * b
        }
      }
      ctx.putImageData(id, 0, 0)

      if (this.textures.exists(key)) this.textures.remove(key)
      this.textures.addCanvas(key, canvas)
    })
    this.textures.remove(rawKey)
  }

  _makeKeyTexture() {
    const W = 32, H = 20
    const g = this.add.graphics()

    // Ring (head of key)
    g.fillStyle(0xffdd00, 1)
    g.fillCircle(8, 10, 8)
    g.fillStyle(0x1a1a00, 1)
    g.fillCircle(8, 10, 4)

    // Shaft
    g.fillStyle(0xffdd00, 1)
    g.fillRect(14, 7, 16, 6)

    // Teeth
    g.fillRect(25, 13, 4, 4)
    g.fillRect(20, 13, 3, 3)

    // Shine
    g.fillStyle(0xffffff, 0.45)
    g.fillCircle(6, 8, 3)

    g.generateTexture('key', W, H)
    g.destroy()
  }

  _makeSingleWallFromImage(rawKey, destKey) {
    const src = this.textures.get(rawKey).getSourceImage()
    const DEST = 32
    const canvas = document.createElement('canvas')
    canvas.width = DEST; canvas.height = DEST
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, DEST, DEST)
    const id = ctx.getImageData(0, 0, DEST, DEST)
    const d = id.data
    for (let p = 0; p < d.length; p += 4) {
      const r = d[p], g = d[p + 1], b = d[p + 2]
      // near-black → dark green background
      if (r < 25 && g < 25 && b < 25) {
        d[p] = 13; d[p + 1] = 26; d[p + 2] = 4; d[p + 3] = 255
      // near-white or very light → transparent (remove background)
      } else if (r > 200 && g > 200 && b > 200) {
        d[p + 3] = 0
      }
    }
    ctx.putImageData(id, 0, 0)
    if (this.textures.exists(destKey)) this.textures.remove(destKey)
    this.textures.addCanvas(destKey, canvas)
    this.textures.remove(rawKey)
  }

  _makeFloorTilesFromImage(rawKey) {
    const src = this.textures.get(rawKey).getSourceImage()
    const DEST = 32
    const floorKeys = ['floor', 'floor2', 'floor3']
    // Three slightly different crops for visual variety
    const crops = [
      [0.05, 0.05],   // top-left region
      [0.45, 0.05],   // top-right region
      [0.25, 0.45],   // center-bottom region
    ]
    const brightness = [1.0, 0.93, 0.87]

    floorKeys.forEach((key, i) => {
      const [ox, oy] = crops[i]
      const sw = src.width, sh = src.height
      const cw = Math.floor(sw * 0.55), ch = Math.floor(sh * 0.55)
      const sx = Math.floor(ox * sw), sy = Math.floor(oy * sh)

      const canvas = document.createElement('canvas')
      canvas.width = DEST; canvas.height = DEST
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(src, sx, sy, cw, ch, 0, 0, DEST, DEST)

      // Replace near-black border pixels with dark brown
      const b = brightness[i]
      const id = ctx.getImageData(0, 0, DEST, DEST)
      const d = id.data
      for (let p = 0; p < d.length; p += 4) {
        if (d[p] < 25 && d[p + 1] < 25 && d[p + 2] < 25) {
          d[p] = 45 * b; d[p + 1] = 28 * b; d[p + 2] = 8 * b; d[p + 3] = 255
        } else {
          d[p] = d[p] * b; d[p + 1] = d[p + 1] * b; d[p + 2] = d[p + 2] * b
        }
      }
      ctx.putImageData(id, 0, 0)

      if (this.textures.exists(key)) this.textures.remove(key)
      this.textures.addCanvas(key, canvas)
    })
    this.textures.remove(rawKey)
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  _soil(g) {
    g.fillStyle(0x3c2008); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x341a06); g.fillRect(0, 16, 32, 16)
  }

  // Full-tile hedge: 3×3 cluster grid covers every pixel
  _hedgeBase(g) {
    g.fillStyle(0x0c1c04); g.fillRect(0, 0, 32, 32)
    const pts = [[4,4],[16,4],[28,4],[4,16],[16,16],[28,16],[4,28],[16,28],[28,28]]
    g.fillStyle(0x183408); for (const [cx,cy] of pts) g.fillCircle(cx, cy, 10)
    g.fillStyle(0x265410); for (const [cx,cy] of pts) g.fillCircle(cx-1, cy-1, 7.5)
    g.fillStyle(0x347018); for (const [cx,cy] of pts) g.fillCircle(cx-2, cy-2, 5.5)
    g.fillStyle(0x468820); for (const [cx,cy] of pts) g.fillCircle(cx-3, cy-3, 3.5)
    g.fillStyle(0x5aa028); for (const [cx,cy] of pts) g.fillCircle(cx-4, cy-4, 2)
  }

  _bush(g, cx, cy, r) {
    g.fillStyle(0x0e2a04); g.fillCircle(cx + 1, cy + 1, r)
    g.fillStyle(0x1a4208); g.fillCircle(cx, cy, r)
    g.fillStyle(0x265c10); g.fillCircle(cx - 1, cy - 1, r * 0.78)
    g.fillStyle(0x347418); g.fillCircle(cx - 2, cy - 2, r * 0.54)
    g.fillStyle(0x448c20); g.fillCircle(cx - 3, cy - 3, r * 0.32)
    g.fillStyle(0x58aa2c); g.fillCircle(cx - 3, cy - 4, r * 0.18)
  }

  _flower(g, cx, cy, color, s = 2.2) {
    g.fillStyle(color)
    g.fillCircle(cx, cy - s, s * 0.8)
    g.fillCircle(cx, cy + s, s * 0.8)
    g.fillCircle(cx - s, cy, s * 0.8)
    g.fillCircle(cx + s, cy, s * 0.8)
    g.fillStyle(0xffee55); g.fillCircle(cx, cy, s * 0.55)
  }

  // ─── FLOOR TILES (brown dirt paths) ──────────────────────────────────────

  _makeFloor() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x3c2008); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x4a2810); g.fillRect(0, 0, 20, 20)
    g.fillStyle(0x341a06); g.fillRect(14, 14, 18, 18)
    g.fillStyle(0x281406)
    for (const [x, y, r] of [[4,3,2],[11,7,1.5],[20,2,2.5],[27,9,1.5],[7,15,1.5],[22,18,2],[3,25,1.5],[16,28,2.5],[29,22,1.5],[10,21,1.5],[24,29,2]]) {
      g.fillEllipse(x, y, r * 2, r * 1.3)
    }
    g.fillStyle(0x543214)
    for (const [x, y] of [[5,4],[12,8],[21,3],[8,22],[17,29],[26,15],[3,12]]) {
      g.fillCircle(x, y, 0.8)
    }
    g.generateTexture('floor', 32, 32)
    g.destroy()
  }

  _makeFloor2() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x3e2208); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x4c2c0e); g.fillRect(0, 0, 32, 18)
    g.fillStyle(0x301606)
    g.fillRect(6, 4, 1, 8); g.fillRect(7, 10, 1, 6); g.fillRect(8, 14, 1, 5)
    g.fillStyle(0x2c1408)
    for (const [x, y, r] of [[3,22,1.5],[14,20,2],[25,24,1.5],[8,28,2],[20,30,1.5],[28,26,2]]) {
      g.fillEllipse(x, y, r * 2, r * 1.3)
    }
    g.generateTexture('floor2', 32, 32)
    g.destroy()
  }

  _makeFloor3() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x341a06); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x3c2008); g.fillRect(0, 0, 32, 16)
    g.fillStyle(0x281206)
    for (const [x, y, r] of [[5,5,2],[16,3,1.5],[26,7,2.5],[9,12,2],[22,10,1.5],[3,20,2],[13,24,2.5],[25,19,2],[7,28,1.5],[20,27,2]]) {
      g.fillEllipse(x, y, r * 2, r * 1.3)
    }
    g.fillStyle(0x4e2a10)
    for (const [x, y] of [[6,6],[17,4],[10,13],[23,11],[14,25],[26,20]]) {
      g.fillCircle(x, y, 0.8)
    }
    g.generateTexture('floor3', 32, 32)
    g.destroy()
  }

  // ─── HEDGE WALLS from real pixel art sheet ────────────────────────────────

  _makeHedgeWalls() {
    const src = this.textures.get('hedge_sheet').getSourceImage()
    const TILE = 16
    const DEST = 32
    // Map each wall key to a (col, row) in the hedge sheet.
    // The sheet is 4×4; rows 0-1 are green hedge tiles, rows 2-3 are ice tiles.
    const mappings = [
      ['wall',       0, 0],
      ['wall2',      1, 0],
      ['wall_tree',  2, 0],
      ['wall_fire',  3, 0],
      ['wall_ruins', 0, 1],
      ['wall_charred',1,1],
      ['wall_park',  2, 1],
      ['wall_school',3, 1],
      ['wall_bank',  0, 0],
    ]
    for (const [key, col, row] of mappings) {
      const canvas = document.createElement('canvas')
      canvas.width = DEST; canvas.height = DEST
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(src, col * TILE, row * TILE, TILE, TILE, 0, 0, DEST, DEST)
      if (this.textures.exists(key)) this.textures.remove(key)
      this.textures.addCanvas(key, canvas)
    }
  }

  // ─── WALL TILES (top-down hedges) ─────────────────────────────────────────

  _makeWall() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    g.generateTexture('wall', 32, 32)
    g.destroy()
  }

  _makeWall2() {
    // Dense hedge + scattered red berries
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    g.fillStyle(0xcc1818)
    for (const [x, y] of [[7,8],[19,5],[29,11],[6,20],[22,17],[14,29],[26,24]]) {
      g.fillCircle(x, y, 2)
    }
    g.fillStyle(0xff4040)
    for (const [x, y] of [[8,9],[20,6],[15,30]]) {
      g.fillCircle(x, y, 1)
    }
    g.generateTexture('wall2', 32, 32)
    g.destroy()
  }

  _makeWallTree() {
    // Single large rounded bush from above
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x0c1c04); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x183408); g.fillCircle(17, 18, 14)
    g.fillStyle(0x265410); g.fillCircle(16, 17, 12)
    g.fillStyle(0x347018); g.fillCircle(14, 15, 10)
    g.fillStyle(0x468820); g.fillCircle(12, 13, 7)
    g.fillStyle(0x5aa028); g.fillCircle(10, 10, 5)
    g.fillStyle(0x6ec030); g.fillCircle(8, 8, 3)
    g.fillStyle(0x82d83a); g.fillCircle(7, 7, 1.5)
    g.generateTexture('wall_tree', 32, 32)
    g.destroy()
  }

  _makeWallRect() {
    // Hedge with red flowers
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    this._flower(g, 6, 8, 0xdd1a1a)
    this._flower(g, 22, 7, 0xcc1010)
    this._flower(g, 28, 16, 0xff2828)
    this._flower(g, 9, 26, 0xdd1a1a)
    this._flower(g, 24, 26, 0xff2020)
    this._flower(g, 17, 12, 0xcc1818, 1.8)
    g.generateTexture('wall_fire', 32, 32)
    g.destroy()
  }

  _makeWallPool() {
    // Hedge with yellow flowers
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    this._flower(g, 6, 9, 0xddaa00)
    this._flower(g, 24, 7, 0xccaa00)
    this._flower(g, 28, 18, 0xeecc00)
    this._flower(g, 9, 27, 0xddaa00)
    this._flower(g, 24, 26, 0xffcc00)
    this._flower(g, 16, 11, 0xeebb00, 1.8)
    g.generateTexture('wall_ruins', 32, 32)
    g.destroy()
  }

  _makeWallDouble() {
    // Hedge with lavender flowers
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    this._flower(g, 7, 9, 0xaa66cc)
    this._flower(g, 22, 8, 0xcc88ee)
    this._flower(g, 27, 20, 0xaa66cc)
    this._flower(g, 10, 26, 0xbb77dd)
    this._flower(g, 20, 26, 0xcc88ee, 1.6)
    g.generateTexture('wall_charred', 32, 32)
    g.destroy()
  }

  _makeWallPark() {
    // Hedge with colorful flowers
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    this._flower(g, 5, 7, 0xee2020, 2)
    this._flower(g, 27, 13, 0xcc1010, 2)
    this._flower(g, 16, 5, 0xeecc00, 2)
    this._flower(g, 9, 24, 0xddaa00, 2)
    this._flower(g, 24, 22, 0xaa44cc, 2)
    this._flower(g, 6, 27, 0xdddddd, 2)
    this._flower(g, 13, 13, 0xff7700, 1.8)
    g.generateTexture('wall_park', 32, 32)
    g.destroy()
  }

  _makeWallSchool() {
    // Formal trimmed rectangular hedge
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    // Rectangular overlay for trimmed look
    g.fillStyle(0x0c1c04); g.fillRect(9, 12, 14, 10)
    g.fillStyle(0x468820); g.fillRect(4, 5, 24, 4)
    g.fillStyle(0x5aa028); g.fillRect(5, 5, 22, 2)
    g.fillStyle(0x3a7020)
    for (let i = 0; i < 6; i++) g.fillCircle(6 + i * 4, 6, 1.5)
    g.generateTexture('wall_school', 32, 32)
    g.destroy()
  }

  _makeWallBank() {
    // Hedge with white flowers
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    this._hedgeBase(g)
    this._flower(g, 5, 8, 0xeeeeee)
    this._flower(g, 20, 6, 0xdddddd)
    this._flower(g, 28, 13, 0xffffff)
    this._flower(g, 8, 26, 0xeeeeee)
    this._flower(g, 22, 26, 0xffffff)
    this._flower(g, 16, 12, 0xdddddd, 1.8)
    g.generateTexture('wall_bank', 32, 32)
    g.destroy()
  }

  // ─── EXIT ────────────────────────────────────────────────────────────────

  _makeExit() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x2a1a08); g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x1a3c1a); g.fillRect(4, 5, 24, 22)
    g.fillStyle(0x245224); g.fillRect(5, 6, 22, 20)
    g.fillStyle(0x2e6630); g.fillRect(6, 7, 20, 8); g.fillRect(6, 18, 20, 7)
    g.fillStyle(0x3a7c3c); g.fillRect(7, 8, 18, 6); g.fillRect(7, 19, 18, 5)
    g.fillStyle(0xaa1e00); g.fillRect(6, 15, 20, 3)
    g.fillStyle(0xee2a00); g.fillRect(7, 16, 18, 1)
    g.fillStyle(0xa0a0a0); g.fillRect(4, 8, 2, 4); g.fillRect(4, 19, 2, 4)
    g.fillStyle(0x00ee44)
    g.fillRect(0, 0, 32, 3); g.fillRect(0, 29, 32, 3)
    g.fillRect(0, 0, 3, 32); g.fillRect(29, 0, 3, 32)
    g.fillStyle(0x00ff66)
    g.fillRect(9, 15, 12, 2)
    g.fillRect(17, 13, 2, 2); g.fillRect(19, 14, 2, 1)
    g.fillRect(17, 17, 2, 2); g.fillRect(19, 17, 2, 1)
    g.generateTexture('exit', 32, 32)
    g.destroy()
  }

  // ─── WEAPONS ─────────────────────────────────────────────────────────────

  _makeSword() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xb0b8c0); g.fillRect(14, 2, 4, 18)
    g.fillStyle(0xd8e0e8); g.fillRect(15, 3, 2, 16)
    g.fillStyle(0xf0f4f8); g.fillRect(15, 3, 1, 10)
    g.fillStyle(0xc8d0d8); g.fillTriangle(14, 2, 18, 2, 16, 0)
    g.fillStyle(0xe8ecf0); g.fillTriangle(15, 2, 17, 2, 16, 0)
    g.fillStyle(0x886622); g.fillRect(7, 19, 18, 4)
    g.fillStyle(0xbb9933); g.fillRect(8, 19, 16, 2)
    g.fillStyle(0xddbb55); g.fillRect(9, 19, 14, 1)
    g.fillStyle(0x664411); g.fillRect(7, 19, 2, 4); g.fillRect(23, 19, 2, 4)
    g.fillStyle(0x5a3010); g.fillRect(14, 23, 4, 6)
    g.fillStyle(0x7a4c28); g.fillRect(15, 23, 2, 6)
    g.fillStyle(0x5a3010); g.fillRect(14, 25, 4, 1); g.fillRect(14, 27, 4, 1)
    g.fillStyle(0x886622); g.fillCircle(16, 30, 3)
    g.fillStyle(0xbbaa44); g.fillCircle(16, 29, 2)
    g.fillStyle(0xddcc66); g.fillRect(15, 28, 2, 2)
    g.generateTexture('sword', 32, 32)
    g.destroy()
  }

  _makeArrow() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x7a5510); g.fillRect(2, 14, 22, 4)
    g.fillStyle(0xa07828); g.fillRect(2, 15, 22, 2)
    g.fillStyle(0xc09040); g.fillRect(4, 15, 18, 1)
    g.fillStyle(0x808898); g.fillTriangle(24, 12, 24, 20, 32, 16)
    g.fillStyle(0xa8b0bc); g.fillTriangle(25, 13, 25, 19, 31, 16)
    g.fillStyle(0xc8d0d8); g.fillTriangle(26, 14, 26, 18, 30, 16)
    g.fillStyle(0xaa2222); g.fillTriangle(2, 14, 0, 9, 6, 14); g.fillTriangle(2, 18, 0, 23, 6, 18)
    g.fillStyle(0xdd3333); g.fillTriangle(2, 14, 1, 10, 5, 14); g.fillTriangle(2, 18, 1, 22, 5, 18)
    g.fillStyle(0xff5555); g.fillTriangle(2, 14, 2, 11, 4, 14); g.fillTriangle(2, 18, 2, 21, 4, 18)
    g.generateTexture('arrow', 32, 32)
    g.destroy()
  }

  _makeShotgun() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    // Two barrels
    g.fillStyle(0x606060); g.fillRect(0, 11, 22, 4); g.fillRect(0, 17, 22, 4)
    g.fillStyle(0x888888); g.fillRect(0, 12, 22, 1); g.fillRect(0, 18, 22, 1)
    g.fillStyle(0x404040); g.fillRect(0, 11, 3, 10)
    g.fillStyle(0x555555); g.fillRect(1, 12, 1, 8)
    // Breach
    g.fillStyle(0x484848); g.fillRect(20, 10, 5, 12)
    g.fillStyle(0x606060); g.fillRect(21, 11, 3, 10)
    // Stock (wood)
    g.fillStyle(0x7a4520); g.fillRect(25, 11, 7, 10)
    g.fillStyle(0x9a5a2a); g.fillRect(25, 12, 7, 4)
    g.fillStyle(0x5a3010); g.fillRect(25, 21, 7, 2)
    // Trigger guard
    g.fillStyle(0x383838); g.fillRect(17, 21, 7, 2)
    g.generateTexture('shotgun', 32, 32)
    g.destroy()
  }

  _makeFutureWeapon() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    // Main body (dark hull)
    g.fillStyle(0x18182a); g.fillRect(4, 11, 22, 10)
    g.fillStyle(0x22223a); g.fillRect(5, 12, 20, 8)
    // Top fin
    g.fillStyle(0x1c1c30); g.fillRect(10, 9, 12, 3)
    g.fillStyle(0x242440); g.fillRect(11, 9, 10, 2)
    // Energy core (glowing blue)
    g.fillStyle(0x001466); g.fillRect(9, 13, 8, 6)
    g.fillStyle(0x0033aa); g.fillRect(10, 14, 6, 4)
    g.fillStyle(0x0055dd); g.fillRect(11, 14, 4, 3)
    g.fillStyle(0x44aaff); g.fillRect(12, 15, 2, 2)
    g.fillStyle(0x88ccff); g.fillRect(12, 15, 1, 1)
    // Barrel (glowing)
    g.fillStyle(0x001444); g.fillRect(0, 14, 10, 4)
    g.fillStyle(0x0044aa); g.fillRect(0, 14, 9, 2)
    g.fillStyle(0x0088ee); g.fillRect(0, 14, 5, 1)
    // Barrel tip glow
    g.fillStyle(0x00ccff); g.fillCircle(1, 16, 2.5)
    g.fillStyle(0x66eeff); g.fillCircle(1, 16, 1.5)
    g.fillStyle(0xaafcff); g.fillCircle(1, 16, 0.8)
    // Stock
    g.fillStyle(0x18182a); g.fillRect(26, 12, 6, 8)
    g.fillStyle(0x24243c); g.fillRect(27, 13, 4, 6)
    // Accent lights
    g.fillStyle(0x0077dd)
    g.fillRect(16, 9, 2, 1); g.fillRect(19, 9, 2, 1)
    g.fillRect(17, 11, 1, 8)
    g.fillStyle(0x0044aa); g.fillRect(17, 11, 1, 3)
    g.generateTexture('future_weapon', 32, 32)
    g.destroy()
  }

  // ─── OTHER ───────────────────────────────────────────────────────────────

  _makeRobotFallback() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x556677); g.fillRect(6, 8, 20, 18)
    g.fillStyle(0x778899); g.fillRect(8, 10, 16, 14)
    g.fillStyle(0xff2200); g.fillEllipse(11, 15, 4, 3); g.fillEllipse(21, 15, 4, 3)
    g.fillStyle(0x445566); g.fillRect(4, 6, 6, 6); g.fillRect(22, 6, 6, 6)
    g.fillStyle(0x334455); g.fillRect(2, 22, 8, 6); g.fillRect(22, 22, 8, 6)
    g.fillStyle(0xffaa00); g.fillCircle(4, 16, 3)
    g.generateTexture('robot', 32, 32)
    g.destroy()
  }

  _makeMonsterFallback() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xcc8800); g.fillCircle(16, 18, 12)
    g.fillStyle(0xee9900); g.fillCircle(14, 15, 6)
    g.fillStyle(0x884400)
    g.fillTriangle(10, 10, 13, 4, 16, 10); g.fillTriangle(16, 10, 19, 4, 22, 10)
    g.fillStyle(0xff0000); g.fillCircle(12, 15, 3); g.fillCircle(20, 15, 3)
    g.fillStyle(0xffaa00); g.fillCircle(12, 15, 1.5); g.fillCircle(20, 15, 1.5)
    g.generateTexture('monster', 32, 32)
    g.destroy()
  }

  _makeBullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffff88); g.fillCircle(4, 4, 4)
    g.fillStyle(0xffffff); g.fillCircle(3, 3, 2)
    g.generateTexture('bullet', 8, 8)
    g.destroy()
  }

  _makeHealth() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xff4444)
    g.fillRect(12, 6, 8, 20); g.fillRect(6, 12, 20, 8)
    g.generateTexture('health', 32, 32)
    g.destroy()
  }

  _makeArmorBox(key, baseColor, lidColor, glowColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    // Glow outline
    g.fillStyle(glowColor); g.fillRect(3, 5, 26, 22)
    // Box body
    g.fillStyle(baseColor); g.fillRect(4, 6, 24, 20)
    // Lid strip
    g.fillStyle(lidColor); g.fillRect(4, 6, 24, 6)
    g.fillStyle(glowColor); g.fillRect(4, 11, 24, 1)
    // Grain lines (darker than base)
    const r = (baseColor >> 16 & 0xff) >> 1
    const gr = (baseColor >> 8 & 0xff) >> 1
    const b = (baseColor & 0xff) >> 1
    const dark = (r << 16) | (gr << 8) | b
    g.fillStyle(dark)
    g.fillRect(10, 13, 1, 12); g.fillRect(16, 13, 1, 12); g.fillRect(22, 13, 1, 12)
    // Metal corner bolts
    g.fillStyle(glowColor)
    g.fillRect(4, 6, 3, 3); g.fillRect(25, 6, 3, 3)
    g.fillRect(4, 23, 3, 3); g.fillRect(25, 23, 3, 3)
    // Center clasp
    g.fillStyle(glowColor); g.fillRect(14, 10, 4, 3)
    g.fillStyle(0xffffff); g.fillRect(15, 11, 2, 1)
    g.generateTexture(key, 32, 32)
    g.destroy()
  }

  _makeSerpienteSegment() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x0a2200); g.fillEllipse(16, 16, 30, 22)
    g.fillStyle(0x1a4400); g.fillEllipse(15, 15, 26, 18)
    g.fillStyle(0x285500); g.fillEllipse(14, 14, 20, 14)
    // Scale highlights
    g.fillStyle(0x44cc00, 0.35)
    g.fillEllipse(9,  13, 5, 3)
    g.fillEllipse(16, 12, 5, 3)
    g.fillEllipse(23, 13, 5, 3)
    // Radioactive drip
    g.fillStyle(0x33ff00, 0.5); g.fillCircle(13, 20, 2); g.fillCircle(20, 21, 1.5)
    g.generateTexture('serpiente_segment', 32, 32)
    g.destroy()
  }

  _makePoisonBullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    // Outer acid glow
    g.fillStyle(0x004d1a); g.fillCircle(8, 9, 8)
    // Main acid drop
    g.fillStyle(0x00aa33); g.fillCircle(8, 8, 6)
    g.fillStyle(0x00dd44); g.fillCircle(7, 8, 5)
    // Bright core
    g.fillStyle(0x22ff55); g.fillCircle(7, 7, 3.5)
    // Highlight bubble
    g.fillStyle(0x88ffaa); g.fillCircle(6, 6, 1.8)
    g.fillStyle(0xddfff0); g.fillCircle(5, 5, 0.9)
    // Small bubble accent
    g.fillStyle(0x44ff77); g.fillCircle(10, 6, 1.5)
    g.fillStyle(0xaaffcc); g.fillCircle(10, 6, 0.7)
    g.generateTexture('poison_bullet', 16, 16)
    g.destroy()
  }

  _makeWebBullet() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xddddee); g.fillCircle(6, 6, 6)
    g.fillStyle(0xffffff); g.fillCircle(6, 6, 3)
    g.lineStyle(1, 0xaaaacc, 0.9)
    g.lineBetween(0, 6, 12, 6)
    g.lineBetween(6, 0, 6, 12)
    g.lineBetween(2, 2, 10, 10)
    g.lineBetween(10, 2, 2, 10)
    g.generateTexture('web_bullet', 12, 12)
    g.destroy()
  }

  _makeSerpienteFallback() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x226600); g.fillEllipse(16, 16, 28, 20)
    g.fillStyle(0x33aa00); g.fillEllipse(14, 14, 22, 16)
    g.fillStyle(0x55cc22); g.fillEllipse(12, 12, 16, 12)
    g.fillStyle(0xff2200); g.fillCircle(6, 14, 2.5); g.fillCircle(26, 14, 2.5)
    g.fillStyle(0xffcc00); g.fillCircle(6, 14, 1); g.fillCircle(26, 14, 1)
    g.fillStyle(0x44ee00)
    g.fillTriangle(0, 15, 4, 12, 4, 18)
    g.generateTexture('serpiente', 32, 32)
    g.destroy()
  }

  _makeAraniaFallback() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x221133); g.fillCircle(16, 18, 10)
    g.fillStyle(0x442266); g.fillCircle(15, 16, 7)
    g.fillStyle(0x663399); g.fillCircle(16, 12, 5)
    g.fillStyle(0x8844aa); g.fillCircle(15, 11, 3)
    g.lineStyle(2, 0x553377, 1)
    const legs = [[-4,-10],[-8,-4],[-10,2],[-8,8],[4,-10],[8,-4],[10,2],[8,8]]
    for (const [lx, ly] of legs) g.lineBetween(16, 16, 16 + lx, 16 + ly)
    g.fillStyle(0xff3333); g.fillCircle(13, 11, 1.5); g.fillCircle(19, 11, 1.5)
    g.generateTexture('arania', 32, 32)
    g.destroy()
  }

  _makeWeaponTile() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    // Outer glow ring
    g.fillStyle(0xaaddff); g.fillRect(0, 0, 32, 32)
    // White body
    g.fillStyle(0xddeeff); g.fillRect(1, 1, 30, 30)
    g.fillStyle(0xeef6ff); g.fillRect(3, 3, 26, 26)
    g.fillStyle(0xf8fbff); g.fillRect(6, 6, 20, 20)
    // Bright white center
    g.fillStyle(0xffffff); g.fillRect(10, 10, 12, 12)
    g.fillStyle(0xffffff); g.fillRect(13, 13, 6, 6)
    // Edge highlight lines
    g.fillStyle(0xffffff)
    g.fillRect(1, 1, 30, 1); g.fillRect(1, 30, 30, 1)
    g.fillRect(1, 1, 1, 30); g.fillRect(30, 1, 1, 30)
    // Sparkle crosses at corners
    g.fillStyle(0xaaddff)
    g.fillRect(3, 3, 3, 1); g.fillRect(4, 2, 1, 3)
    g.fillRect(26, 3, 3, 1); g.fillRect(27, 2, 1, 3)
    g.fillRect(3, 28, 3, 1); g.fillRect(4, 27, 1, 3)
    g.fillRect(26, 28, 3, 1); g.fillRect(27, 27, 1, 3)
    g.generateTexture('weapon_tile', 32, 32)
    g.destroy()
  }

  // ─── NIVEL 2: piso metálico (diamond plate) — imagen a resolución nativa ──
  _makeMetalFloorTiles(rawKey) {
    const src = this.textures.get(rawKey).getSourceImage()
    const sw = src.width, sh = src.height
    // Four crops from different quadrants for visual variety
    const cw = Math.floor(sw * 0.6), ch = Math.floor(sh * 0.6)
    const crops = [
      [0,       0      ],
      [sw - cw, 0      ],
      [0,       sh - ch],
      [sw - cw, sh - ch],
    ]
    const floorKeys = ['floor_l2', 'floor_l2b', 'floor_l2c', 'floor_l2d']

    floorKeys.forEach((key, i) => {
      const [sx, sy] = crops[i]
      const canvas = document.createElement('canvas')
      canvas.width = cw; canvas.height = ch
      const ctx = canvas.getContext('2d')
      ctx.drawImage(src, sx, sy, cw, ch, 0, 0, cw, ch)
      if (this.textures.exists(key)) this.textures.remove(key)
      this.textures.addCanvas(key, canvas)
    })
    this.textures.remove(rawKey)
  }

  // ─── NIVEL 2: muro metálico sci-fi — imagen a su resolución nativa ────────
  _makeMetalWallTile(rawKey, destKey) {
    const src = this.textures.get(rawKey).getSourceImage()
    // Keep the texture at native resolution; GameScene uses setDisplaySize to fit TILE×TILE.
    // Phaser's bilinear filter (pixelArt disabled) handles the smooth downscale on GPU.
    const canvas = document.createElement('canvas')
    canvas.width = src.width; canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)
    if (this.textures.exists(destKey)) this.textures.remove(destKey)
    this.textures.addCanvas(destKey, canvas)
    this.textures.remove(rawKey)
  }
}
