let _ctx = null

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function noise(ac, duration) {
  const samples = Math.floor(ac.sampleRate * duration)
  const buf = ac.createBuffer(1, samples, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < samples; i++) d[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  return src
}

// ── Game Over sound ───────────────────────────────────────────────────────

export function gameOverSound(volume = 1) {
  const ac = ctx()
  const now = ac.currentTime

  // Golpe grave inicial
  const bass = ac.createOscillator()
  bass.type = 'sine'
  bass.frequency.setValueAtTime(120, now)
  bass.frequency.exponentialRampToValueAtTime(40, now + 0.6)
  const bassGain = ac.createGain()
  bassGain.gain.setValueAtTime(0.6 * volume, now)
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
  bass.connect(bassGain); bassGain.connect(ac.destination)
  bass.start(now); bass.stop(now + 0.7)

  // Descenso melódico: 4 tonos cada 0.35s
  const notes = [440, 330, 247, 165]
  notes.forEach((freq, i) => {
    const t = now + 0.3 + i * 0.35
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.32)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.18 * volume, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.34)
    osc.connect(g); g.connect(ac.destination)
    osc.start(t); osc.stop(t + 0.35)
  })

  // Ruido de "muerte" al final
  const noiseSrc = noise(ac, 0.5)
  const noiseFilter = ac.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(800, now + 1.7)
  noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 2.2)
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.22 * volume, now + 1.7)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)
  noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ac.destination)
  noiseSrc.start(now + 1.7)
}

// ── UI sounds ─────────────────────────────────────────────────────────────

export function menuClick(volume = 1) {
  const ac = ctx()
  const now = ac.currentTime

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(900, now)
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.1)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.25 * volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.12)
}

// ── Spider sounds ──────────────────────────────────────────────────────────

// Eerie screech when the araña attacks melee
export function spiderScreech(volume = 1) {
  const ac = ctx()
  const now = ac.currentTime

  // Sawtooth shriek dropping from high pitch
  const osc = ac.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(1100, now)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.45)

  // LFO for an unsettling warble
  const lfo = ac.createOscillator()
  lfo.frequency.value = 18
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 60
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)

  // Noise layer for roughness
  const noiseSrc = noise(ac, 0.45)
  const noiseFilter = ac.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 900
  noiseFilter.Q.value = 1.5
  noiseSrc.connect(noiseFilter)

  const nGain = ac.createGain()
  nGain.gain.setValueAtTime(0.18 * volume, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
  noiseFilter.connect(nGain)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.28 * volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
  osc.connect(gain)

  gain.connect(ac.destination)
  nGain.connect(ac.destination)

  lfo.start(now); lfo.stop(now + 0.45)
  osc.start(now); osc.stop(now + 0.45)
  noiseSrc.start(now)
}

// Sticky web-shooting whoosh
export function spiderWebShot(volume = 1) {
  const ac = ctx()
  const now = ac.currentTime

  const noiseSrc = noise(ac, 0.25)

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.exponentialRampToValueAtTime(1800, now + 0.12)
  filter.Q.value = 2.5

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.35 * volume, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

  noiseSrc.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  noiseSrc.start(now)
}

// Rapid mandible clicking — plays when the spider is near the player
export function spiderChitter(volume = 1) {
  const ac = ctx()
  const clicks = 6
  for (let i = 0; i < clicks; i++) {
    const t = ac.currentTime + i * 0.045
    const noiseSrc = noise(ac, 0.018)

    const filter = ac.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2200 + Math.random() * 800

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.22 * volume * (1 - i * 0.08), t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018)

    noiseSrc.connect(filter)
    filter.connect(gain)
    gain.connect(ac.destination)
    noiseSrc.start(t)
  }
}
