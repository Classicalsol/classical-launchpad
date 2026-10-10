'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Fingerprint as FingerprintIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QubitLab } from '@/components/qubit-lab'
import { fingerprint, experimentReport, tokenExperimentInput, type Fingerprint } from '@/lib/token-experiments'
import { cn } from '@/lib/utils'

type Props = { mint: string; signature?: string; mode?: 'registered' | 'external' | 'demo'; compact?: boolean }

export function TokenLab({ mint, signature, mode = 'external', compact = false }: Props) {
  const input = tokenExperimentInput(mint, signature)
  const [result, setResult] = useState<Fingerprint | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')
  const current = result?.input === input ? result : null

  useEffect(() => {
    let cancelled = false
    setError('')
    setFlipped(false)
    fingerprint(input).then(value => { if (!cancelled) setResult(value) }).catch(() => {
      if (!cancelled) setError('SHA-256 is unavailable. Use a modern browser over HTTPS to run this experiment.')
    })
    return () => { cancelled = true }
  }, [input])

  function download() {
    if (!current) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(experimentReport(current, mode), null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'classical-token-experiment.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <section className="panel overflow-hidden" aria-label="Token experiment lab">
    <div className="panel-top"><div className="flex items-center gap-3"><FingerprintIcon className="size-5 text-primary"/><h2 className="text-xl font-medium">Your token. Its own experiment.</h2></div><Badge variant="outline">{mode === 'registered' ? 'Registered launch input' : mode === 'demo' ? 'Demo input · no token launched' : 'External mint · unverified provenance'}</Badge></div>
    <div className="flex flex-col gap-6 p-5 md:p-7"><p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">A reproducible cryptographic fingerprint, a 256-bit identity, and a quantum-gate sandbox. Real classical computation—attached to this token&apos;s workspace, not added to its on-chain program.</p>
      {error ? <p role="alert" className="text-sm text-primary">{error}</p> : !current ? <p role="status" className="font-mono text-sm text-muted-foreground">Computing SHA-256 fingerprint…</p> : <div className={cn('grid min-w-0 gap-8', !compact && 'lg:grid-cols-2')}>
        <section className="flex min-w-0 flex-col gap-5" aria-label="SHA-256 avalanche experiment">
          <div className="flex flex-col gap-2"><p className="eyebrow">Classical behavior / actual SHA-256</p><h3 className="text-2xl font-medium">Flip one bit. Change the picture.</h3><p className="text-sm leading-relaxed text-muted-foreground">Every square is one output bit, in order. Filled means 1. The same exact input always produces the same fingerprint.</p></div>
          <div role="img" aria-label={flipped ? `Mutated hash: ${current.changedBits} of 256 output bits differ. Outlined squares mark changed bits.` : 'Original 256-bit SHA-256 fingerprint. Filled squares represent ones.'} className="grid grid-cols-16 gap-1 rounded-md border border-border bg-background p-4">
            {(flipped ? current.flippedBits : current.bits).map((bit, index) => <span aria-hidden="true" key={index} className={cn('aspect-square rounded-xs border border-transparent transition-colors duration-300 motion-reduce:transition-none', bit ? 'bg-primary' : 'bg-card', flipped && current.bits[index] !== current.flippedBits[index] && 'border-foreground')}/>) }
          </div>
          <div className="flex flex-col gap-2"><p className="font-mono text-sm text-muted-foreground">{flipped ? 'Mutated digest / first input byte XOR 0x01' : 'Original digest / SHA-256'}</p><code className="break-all text-sm leading-relaxed text-primary">{flipped ? current.flippedHash : current.hash}</code></div>
          <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => setFlipped(value => !value)}>{flipped ? 'Restore original input' : 'Flip one input bit'}</Button><Button type="button" variant="ghost" onClick={download}><Download data-icon="inline-start"/>Download experiment</Button></div>
          <p role="status" className="text-sm leading-relaxed text-muted-foreground">{flipped ? `${current.changedBits} / 256 output bits changed (${(current.changedBits / 256 * 100).toFixed(1)}%). This is the avalanche effect, not a security score.` : 'Input mutation affects this experiment only. Your mint address and token remain unchanged.'}</p>
          <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Inspect exact fingerprint input</summary><pre className="mt-3 whitespace-pre-wrap break-all rounded-md border border-border bg-background p-4 font-mono text-sm">{input}</pre></details>
        </section>
        <QubitLab key={current.hash} initialBit={current.bits[0] as 0 | 1}/>
      </div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground"><span>No wallet signatures, fees, rewards, or token changes. Experiments reset on reload.</span><Link href="/docs#token-lab" className="text-primary hover:underline">How the lab works →</Link></div>
    </div>
  </section>
}
