export type Qubit = readonly [number, number]
export type Gate = 'H' | 'X' | 'Z'

export function applyGate([a, b]: Qubit, gate: Gate): Qubit {
  const next: Qubit = gate === 'H' ? [(a + b) * Math.SQRT1_2, (a - b) * Math.SQRT1_2] : gate === 'X' ? [b, a] : [a, -b]
  const norm = Math.hypot(...next)
  return [next[0] / norm, next[1] / norm]
}

export function measureQubit(state: Qubit, random: number): 0 | 1 {
  if (random < 0 || random >= 1 || !Number.isFinite(random)) throw new Error('Sample must be in [0, 1).')
  return random < state[0] ** 2 ? 0 : 1
}

export function hashBits(hex: string): number[] {
  return [...hex].flatMap(char => parseInt(char, 16).toString(2).padStart(4, '0').split('').map(Number))
}

export async function fingerprint(input: string) {
  const original = new TextEncoder().encode(input)
  if (!original.length) throw new Error('A fingerprint needs a non-empty input.')
  const changed = original.slice()
  changed[0] ^= 1
  const digest = async (bytes: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
  const [hash, flippedHash] = await Promise.all([digest(original), digest(changed)])
  const bits = hashBits(hash)
  const flippedBits = hashBits(flippedHash)
  return { input, hash, flippedHash, bits, flippedBits, changedBits: bits.filter((bit, index) => bit !== flippedBits[index]).length }
}

export function tokenExperimentInput(mint: string, signature?: string) {
  return `classical:token-lab:v1\nmint:${mint}\ntransaction:${signature ?? 'unregistered'}`
}

export type Fingerprint = Awaited<ReturnType<typeof fingerprint>>

export function experimentReport(result: Fingerprint, mode: string) {
  return {
    version: 'classical:token-lab:v1', mode, algorithm: 'SHA-256', encoding: 'UTF-8',
    input: result.input, fingerprint: result.hash,
    mutation: 'XOR first UTF-8 byte with 0x01', mutatedFingerprint: result.flippedHash,
    changedOutputBits: result.changedBits, totalOutputBits: 256,
    notice: 'Locally computed, unsigned report. Not an on-chain certificate, security audit, proof of ownership, or post-quantum protection.',
  }
}
