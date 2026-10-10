import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Terminal, Fingerprint, ShieldCheck, Cpu, ScanLine, Blocks, ChevronRight } from 'lucide-react'
import { HashConsole } from '@/components/hash-console'
import { ScannerEntry } from '@/components/scanner-entry'

const tools = [
  { title: 'Proof Engine', text: 'Don’t trust. Compute. Verify transactions, signatures, and Merkle proofs.', icon: Fingerprint, tag: 'CRYPTOGRAPHIC VERIFICATION', href: '/proof', command: 'verify --trust=zero' },
  { title: 'Compute Terminal', text: 'Real algorithms. Real outputs. Your own sandbox for classical computation.', icon: Terminal, tag: 'YOUR BROWSER. YOUR COMPUTE.', href: '/terminal', command: 'classical run --interactive' },
  { title: 'Proof of Launch', text: 'Every launch, on the record. Inspect token authorities, supply, and provenance.', icon: Blocks, tag: 'PUBLIC ON-CHAIN RECORDS', href: '/discover', command: 'inspect --source=chain' },
]
export default function Page() {
  return <main>
    <section className="shell relative border-x border-border/35">
      <div className="relative isolate overflow-hidden px-5 pb-12 pt-12 md:px-8 md:pb-14 md:pt-16 lg:px-10 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-surface opacity-[0.17]"/>
        <div className="pointer-events-none absolute -right-28 top-0 -z-10 hidden h-full w-[75%] lg:block"><Image src="/images/classical-core.png" alt="" fill priority sizes="75vw" className="hero-core object-contain object-right"/></div>
        <div className="reveal relative flex max-w-3xl flex-col gap-7">
          <div className="flex items-center gap-3 font-mono text-sm tracking-wide"><span className="h-px w-7 bg-primary"/><span className="text-primary">THE PROOF OF COMPUTING LAUNCHPAD</span></div>
          <h1 className="text-[clamp(2.65rem,4.5vw,4.65rem)] font-semibold uppercase leading-[1.04] tracking-[-0.055em]"><span className="outline-type">Quantum is<br/>the theory.</span><br/>Classical is<br/><span className="text-primary">the foundation.</span></h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">Launch tokens. Verify the cryptography.<br/>Explore the computation powering blockchain.</p>
          <div className="flex flex-wrap gap-3 pt-1"><Link href="/launch" className="action">Launch token<ArrowUpRight className="size-4"/></Link><Link href="/proof" className="action action-secondary"><Fingerprint className="size-4"/>Open Proof Engine</Link></div>
          <Link href="/explore" className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">Explore classical computing<ArrowRight className="size-4"/></Link>
        </div>
        <div className="absolute bottom-10 right-9 hidden text-right font-mono text-sm lg:block"><p className="text-muted-foreground">CLASSICAL COMPUTE ARCHITECTURE</p><p className="mt-2 text-primary">DETERMINISTIC. VERIFIABLE. REAL.</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-y border-border bg-card/65 px-5 py-5 font-mono text-sm md:px-10"><span className="flex items-center gap-2 text-signal"><span className="status-dot"/>LOCAL COMPUTE READY</span><span className="flex items-center gap-2 text-muted-foreground"><Cpu className="size-4"/>SHA-256 / WEB CRYPTO</span><span className="hidden items-center gap-2 text-muted-foreground sm:flex"><ShieldCheck className="size-4"/>NO FABRICATED METRICS</span><span className="text-muted-foreground">BUILT ON <span className="text-foreground">SOLANA</span></span></div>
    </section>
    <section className="shell py-12 md:py-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div className="flex flex-col gap-2"><span className="eyebrow">THE CLASSICAL TOOLKIT</span><h2 className="text-2xl font-medium tracking-tight md:text-3xl">Less speculation. More verification.</h2></div><span className="font-mono text-sm text-muted-foreground">REAL TOOLS. NOT ROADMAPS.</span></div>
      <div className="grid gap-4 md:grid-cols-3">{tools.map(t => <Link href={t.href} key={t.title} className="tool-card"><div className="flex flex-1 flex-col gap-4 p-6"><div className="flex items-center justify-between"><t.icon className="size-7 text-primary" strokeWidth={1.4}/><ArrowUpRight className="tool-arrow size-5 text-muted-foreground transition"/></div><div className="flex flex-col gap-2"><h3 className="text-xl font-medium">{t.title}</h3><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t.text}</p></div></div><div className="flex items-center gap-2 border-t border-border px-6 py-3 font-mono text-sm text-muted-foreground"><span className="text-primary">›</span>{t.command}</div></Link>)}</div>
    </section>
    <section className="shell grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <div className="panel overflow-hidden"><div className="panel-top"><span className="flex items-center gap-2 font-mono text-sm"><ScanLine className="size-4 text-primary"/>CLASSICAL SECURITY SCANNER</span><span className="flex items-center gap-2 font-mono text-sm text-muted-foreground"><span className="status-dot"/>RPC-BACKED</span></div><div className="flex flex-col gap-5 p-6 md:p-8"><div className="flex flex-col gap-3"><h2 className="text-2xl font-medium tracking-tight">Know what you&apos;re holding.</h2><p className="max-w-md text-sm leading-relaxed text-muted-foreground">Inspect authorities, holder concentration, and token permissions. Findings you can verify. Not a made-up safety score.</p></div><ScannerEntry/><div className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-sm text-muted-foreground">{['Mint authority', 'Freeze authority', 'Token-2022'].map(t => <span className="flex items-center gap-2" key={t}><ChevronRight className="size-3 text-primary"/>{t}</span>)}</div><p className="text-sm text-muted-foreground/80">Transparent checks. Explicit unknowns. Never a guarantee of safety.</p></div></div>
      <HashConsole/>
    </section>
    <section className="shell flex flex-col justify-between gap-6 border-b border-border pb-12 pt-14 md:flex-row md:items-end"><div className="flex flex-col gap-3"><span className="eyebrow">BEFORE QUANTUM, THERE WAS CLASSICAL.</span><h2 className="max-w-2xl text-balance text-3xl font-medium tracking-tight">Other projects can promise the future.<br/><span className="text-muted-foreground">Classical proves what works today.</span></h2></div><Link href="/explore" className="flex shrink-0 items-center gap-3 font-mono text-sm text-primary">Enter the computing exhibit<ArrowUpRight className="size-4"/></Link></section>
  </main>
}
