'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Terminal, ArrowUpRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
export function HashConsole() {
  const [input, setInput] = useState('Before quantum, there was classical.')
  const [result, setResult] = useState('')
  const [ms, setMs] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function run() { setBusy(true); setError(''); try { const start = performance.now(); const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)); setResult(Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('')); setMs((performance.now()-start).toFixed(2)) } catch { setError('Web Crypto is unavailable. Open this site over HTTPS.') } finally {setBusy(false)} }
  return <div className="panel overflow-hidden"><div className="panel-top"><span className="flex items-center gap-2 font-mono text-sm"><Terminal className="size-4 text-primary"/>COMPUTE TERMINAL</span><Link href="/terminal" aria-label="Open full compute terminal"><ArrowUpRight className="size-4 text-muted-foreground"/></Link></div><div className="terminal-lines flex flex-col gap-5 p-6 font-mono text-sm md:p-8"><div className="flex flex-col gap-1 text-muted-foreground"><p>Classical Compute Environment / v1.0</p><p>Local execution. No server. No guesswork.</p></div><form onSubmit={e => {e.preventDefault(); void run()}} className="flex flex-col gap-3"><Field><FieldLabel htmlFor="quick-hash"><span className="text-primary">classical ~ $</span> sha256</FieldLabel><div className="flex gap-2"><Input id="quick-hash" value={input} onChange={e => setInput(e.target.value)} maxLength={10000}/><Button type="submit" variant="outline" disabled={busy} aria-label="Run SHA-256 hash"><Play/></Button></div></Field></form><div aria-live="polite" className="min-h-16 break-all leading-relaxed">{error ? <p className="text-primary">{error}</p> : result ? <><p className="text-signal">{result}</p><p className="mt-2 text-muted-foreground">✓ Computed locally in {ms} ms · 256 bits</p></> : <p className="text-muted-foreground">Ready for input. Run your first computation.<span className="cursor ml-2 inline-block h-4 w-2 translate-y-0.5 bg-primary"/></p>}</div><div className="flex items-center justify-between border-t border-border pt-4 text-muted-foreground"><span>SHA-256 · WEB CRYPTO</span><Link href="/terminal" className="text-primary hover:underline">Open terminal ↗</Link></div></div></div>
}
