import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Download } from 'lucide-react'
import { LabHeading } from '@/components/lab-heading'
import { TokenLab } from '@/components/token-lab'
import { classicalDocs, classicalSources } from '@/lib/classical-docs'

export const metadata: Metadata = {
  title: 'Documentation — Classical, Quantum & Token Labs',
  description: 'How Classical contrasts bits with qubits, what a Solana token launch creates, and how to run token-specific hashing and quantum-gate experiments.',
}

export default function DocsPage() {
  return <main className="shell">
    <LabHeading tag="CLASSICAL / FIELD GUIDE" title="Less mystique. More computation." description="The idea, the science, and what happens when you launch. A guide to the classical side of computing—with quantum behavior you can explore on an ordinary machine."/>
    <div className="mb-10 flex flex-wrap gap-3"><Link href="/launch" className="action">Launch a token<ArrowUpRight className="size-4"/></Link><a href="/docs/field-guide" download className="action action-secondary"><Download className="size-4"/>Download field guide</a><a href="#playground" className="action action-secondary">Try the laboratory</a></div>
    <div className="grid items-start gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
      <aside className="lg:sticky lg:top-8"><nav aria-label="Documentation contents" className="flex flex-col gap-3"><p className="eyebrow">In this guide</p>{classicalDocs.map(section => <a key={section.id} href={`#${section.id}`} className="text-sm leading-relaxed text-muted-foreground hover:text-primary">{section.title}</a>)}<a href="#playground" className="text-sm text-primary">Interactive playground</a><a href="#references" className="text-sm text-muted-foreground hover:text-primary">References</a></nav></aside>
      <div className="flex min-w-0 flex-col gap-12">
        <div className="panel grid gap-6 p-6 md:grid-cols-2 md:p-8"><div className="flex flex-col gap-3"><p className="eyebrow">Our position</p><p className="text-balance text-3xl font-medium">Bits over buzzwords.</p><p className="leading-relaxed text-muted-foreground">Make the computation the experience. Every token gets something you can inspect, change, and reproduce.</p></div><div className="flex flex-col gap-3 md:border-l md:border-border md:pl-8"><p className="eyebrow">The important distinction</p><p className="text-balance text-3xl font-medium text-primary">A counterpoint. Not a physics claim.</p><p className="leading-relaxed text-muted-foreground">Quantum computing is real. Our hardware is classical. Our simulations are labeled. The difference matters.</p></div></div>
        {classicalDocs.map(section => <section id={section.id} key={section.id} className="flex scroll-mt-8 flex-col gap-5 border-b border-border pb-10"><div className="flex flex-col gap-2"><p className="eyebrow">{section.label}</p><h2 className="text-balance text-2xl font-medium sm:text-3xl">{section.title}</h2></div>{section.paragraphs.map(paragraph => <p key={paragraph} className="max-w-3xl text-pretty leading-relaxed text-muted-foreground">{paragraph}</p>)}{section.bullets.length > 0 && <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
        <section id="playground" className="flex scroll-mt-8 flex-col gap-5"><div className="flex flex-col gap-2"><p className="eyebrow">Try it / no wallet needed</p><h2 className="text-3xl font-medium">An experiment, not a slideshow.</h2><p className="leading-relaxed text-muted-foreground">This demo uses the literal input CLASSICAL-DEMO, not a real mint. Your launched token&apos;s workspace runs the same lab with its own public inputs.</p></div><TokenLab mint="CLASSICAL-DEMO" mode="demo"/></section>
        <section id="references" className="flex scroll-mt-8 flex-col gap-4"><h2 className="text-2xl font-medium">Read the sources.</h2>{classicalSources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm text-primary hover:underline">{source.title}<ArrowUpRight className="size-4 shrink-0"/></a>)}<Link href="/explore" className="text-sm text-muted-foreground hover:text-primary">Explore the side-by-side classical vs. quantum exhibit →</Link></section>
      </div>
    </div>
  </main>
}
