'use client'
import { useRef, useState, useEffect } from 'react'
import { Terminal, Play, Square, Copy, Check, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
const algorithms = [
  {id:'sha256',name:'SHA-256 hashing',sample:'Before quantum, there was classical.',hint:'Hash UTF-8 text with the browser’s native Web Crypto implementation.'},
  {id:'primes',name:'Prime number sieve',sample:'1000',hint:'Sieve of Eratosthenes. Find every prime up to an integer ≤ 1,000,000.'},
  {id:'aes',name:'AES-256-GCM encryption',sample:'Proof, not promises.',hint:'Authenticated encryption and decryption using a fresh, ephemeral key and random IV.'},
  {id:'sort',name:'Merge sort',sample:'42, 7, 256, 16, 3, 99, 1, 64',hint:'Stable merge sort. Enter up to 10,000 finite numbers separated by commas or spaces.'},
  {id:'binary',name:'UTF-8 → binary',sample:'CLASSICAL',hint:'Convert UTF-8 bytes to eight-bit binary representations. Up to 2,000 characters.'},
  {id:'merkle',name:'Merkle tree',sample:'Alice\nBob\nCharlie\nDiana',hint:'Enter up to 16 leaves, one per line. Domain-separated SHA-256 with duplicate-last pairing.'},
]
type Result = {output:string; elapsed:number; operations:number; layers:string[][]|null; algorithm:string}
export function ComputeTerminal({initialAlgorithm='sha256'}:{initialAlgorithm?:string}) {
  const initial = algorithms.find(a=>a.id===initialAlgorithm)??algorithms[0]
  const [algorithm,setAlgorithm]=useState(initial.id)
  const [input,setInput]=useState(initial.sample)
  const [result,setResult]=useState<Result|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [copied,setCopied]=useState(false)
  const worker=useRef<Worker|null>(null)
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const selected=algorithms.find(a=>a.id===algorithm)!
  useEffect(()=>()=>{worker.current?.terminate();if(timer.current)clearTimeout(timer.current)},[])
  function stop() { worker.current?.terminate(); worker.current=null; if(timer.current)clearTimeout(timer.current); setBusy(false) }
  function run() {
    stop();setError('');setResult(null);setCopied(false);setBusy(true)
    try {
      const w=new Worker('/compute-worker.js');worker.current=w
      w.onmessage=e=>{if(e.data.error)setError(e.data.error);else setResult(e.data);stop()}
      w.onerror=()=>{setError('The compute worker could not run. Please check that Web Crypto is available over HTTPS.');stop()}
      timer.current=setTimeout(()=>{stop();setError('Computation stopped after the 5-second execution limit.')},5000)
      w.postMessage({algorithm,input})
    }catch{stop();setError('Web Workers are unavailable in this browser.')}
  }
  return <div className="panel overflow-hidden"><div className="panel-top"><span className="flex items-center gap-2 font-mono text-sm"><Terminal className="size-4 text-primary"/>CLASSICAL COMPUTE ENVIRONMENT</span><span className="flex items-center gap-2 font-mono text-sm text-signal"><span className="status-dot"/>ISOLATED WEB WORKER</span></div><div className="grid lg:grid-cols-[300px_1fr]"><div className="flex flex-col gap-5 border-b border-border p-6 lg:border-b-0 lg:border-r"><Field><FieldLabel htmlFor="algorithm">Algorithm</FieldLabel><select id="algorithm" className="lab-input" value={algorithm} onChange={e=>{stop();setAlgorithm(e.target.value);setInput(algorithms.find(a=>a.id===e.target.value)!.sample);setResult(null);setError('')}}>{algorithms.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select><FieldDescription>{selected.hint}</FieldDescription></Field><div className="flex flex-col gap-3 border-t border-border pt-5 font-mono text-sm text-muted-foreground"><span>EXECUTION POLICY</span><p>Allowlisted algorithms only</p><p>No eval / no arbitrary code</p><p>5-second execution limit</p><p>20,000-character limit</p><p>Inputs stay in this browser</p></div></div><div className="flex min-w-0 flex-col gap-6 p-6"><form onSubmit={e=>{e.preventDefault();run()}} className="flex flex-col gap-4"><Field><FieldLabel htmlFor="compute-input"><span className="font-mono text-primary">classical ~ $ {algorithm}</span></FieldLabel><textarea id="compute-input" value={input} onChange={e=>setInput(e.target.value)} className="lab-input min-h-28 resize-y" maxLength={20000} aria-describedby="compute-limit"/><FieldDescription id="compute-limit">Example input is editable. Results appear only after real execution.</FieldDescription></Field><div className="flex items-center justify-between"><span className="font-mono text-sm text-muted-foreground">{input.length.toLocaleString()} characters</span>{busy ? <Button type="button" variant="outline" onClick={()=>{stop();setError('Computation cancelled.')}}><Square/>Stop</Button> : <Button type="submit"><Play/>Run computation</Button>}</div></form>{error&&<Alert variant="destructive"><AlertTitle>Computation stopped</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}<section aria-live="polite" className="min-h-36 rounded-md border border-border bg-background p-5"><div className="flex items-center justify-between"><h3 className="eyebrow">OUTPUT</h3>{result&&<Button variant="ghost" size="icon" aria-label="Copy output" onClick={async()=>{try{await navigator.clipboard.writeText(result.output);setCopied(true)}catch{setError('Clipboard access is unavailable. Select and copy the output manually.')}}}>{copied?<Check/>:<Copy/>}</Button>}</div>{result?<><pre className="mt-4 whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-signal">{result.output}</pre><div className="mt-6 flex flex-wrap gap-5 border-t border-border pt-4 font-mono text-sm text-muted-foreground"><span>{result.elapsed.toFixed(3)} ms execution</span><span>{result.operations.toLocaleString()} {algorithm==='merkle'?'hash operations':algorithm==='sort'?'items':algorithm==='primes'?'sieve limit':'input bytes'}</span><span>Measured in your browser</span></div></>:<p className="mt-5 flex items-center gap-2 font-mono text-sm text-muted-foreground"><Cpu className="size-4"/>{busy?'Computing…':'Awaiting execution.'}</p>}</section>{result?.layers&&<section className="flex flex-col items-center gap-4 overflow-x-auto rounded-md border border-border p-5"><h3 className="eyebrow">MERKLE TREE / ROOT → LEAVES</h3>{[...result.layers].reverse().map((layer,i)=><div key={i} className="flex w-full flex-wrap justify-center gap-2">{layer.map((hash,j)=><div key={j} title={hash} className="min-w-0 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-sm text-primary">{i===0?'ROOT ':''}{hash.slice(0,8)}…</div>)}</div>)}<p className="text-center text-sm text-muted-foreground">Each level commits to the ordered hashes below it. Hover a node to inspect its full digest.</p></section>}</div></div></div>
}
