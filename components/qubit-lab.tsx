'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { applyGate, measureQubit, type Gate, type Qubit } from '@/lib/token-experiments'

export function QubitLab({ initialBit }: { initialBit: 0 | 1 }) {
  const initial: Qubit = initialBit === 0 ? [1, 0] : [0, 1]
  const [state, setState] = useState<Qubit>(initial)
  const [history, setHistory] = useState<string[]>([])
  const [message, setMessage] = useState('Apply H to create equal measurement probabilities.')
  const [error, setError] = useState('')

  function gate(gate: Gate) {
    setState(previous => applyGate(previous, gate))
    setHistory(previous => [...previous.slice(-15), gate])
    setMessage(gate === 'Z' ? 'Phase flipped. Probabilities may stay the same; a later H reveals interference.' : `${gate} gate applied. Read the amplitudes and probabilities below.`)
  }

  function measure() {
    try {
      const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
      const bit = measureQubit(state, random)
      setState(bit === 0 ? [1, 0] : [0, 1])
      setHistory(previous => [...previous.slice(-15), `M:${bit}`])
      setMessage(`Measured ${bit}. The simulated state is now ${bit}; measure again to get the same result unless you apply another gate.`)
      setError('')
    } catch { setError('Browser randomness is unavailable. Measurement was not performed.') }
  }

  return <section className="flex min-w-0 flex-col gap-5" aria-label="Single-qubit simulator">
    <div className="flex flex-col gap-2"><p className="eyebrow">Quantum behavior / classical simulator</p><h3 className="text-2xl font-medium">Possibility. Interference. Measurement.</h3><p className="text-sm leading-relaxed text-muted-foreground">One simulated qubit, initialized from the first fingerprint bit ({initialBit}). Your CPU calculates the amplitudes. No quantum hardware is connected.</p></div>
    <div className="flex items-center justify-between rounded-md border border-border bg-background p-5 font-mono">
      <div className="flex flex-col gap-2"><span className="text-sm text-muted-foreground">Amplitude of 0</span><span className="text-2xl text-primary">{state[0].toFixed(4)}</span></div>
      <div className="flex flex-col gap-2 text-right"><span className="text-sm text-muted-foreground">Amplitude of 1</span><span className="text-2xl text-primary">{state[1].toFixed(4)}</span></div>
    </div>
    <div className="grid grid-cols-2 gap-3 font-mono text-sm" aria-label="Measurement probabilities"><p className="rounded-md border border-border p-3">Outcome 0 <strong className="block text-lg font-medium">{(state[0] ** 2 * 100).toFixed(1)}%</strong></p><p className="rounded-md border border-border p-3">Outcome 1 <strong className="block text-lg font-medium">{(state[1] ** 2 * 100).toFixed(1)}%</strong></p></div>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => gate('H')}>H · Superpose</Button><Button type="button" variant="outline" onClick={() => gate('X')}>X · Flip</Button><Button type="button" variant="outline" onClick={() => gate('Z')}>Z · Phase</Button><Button type="button" onClick={measure}>Measure</Button><Button type="button" variant="ghost" onClick={() => { setState(initial); setHistory([]); setMessage('Reset to the fingerprint bit.'); setError('') }}>Reset circuit</Button></div>
    <div className="flex flex-col gap-2"><p className="text-sm text-muted-foreground">Recent operations (up to 16)</p><p className="min-h-12 break-words rounded-md border border-border bg-background p-3 font-mono text-sm">{history.length ? history.join(' → ') : `Start: ${initialBit}`}</p></div>
    <p role="status" className="text-sm leading-relaxed text-muted-foreground">{message}</p>{error && <p role="alert" className="text-sm text-primary">{error}</p>}
    <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">Try H → Z → H: interference flips the starting bit. H → H restores it. Measurement samples squared amplitudes using browser randomness; it does not mint, burn, trade, or distribute tokens.</p>
  </section>
}
