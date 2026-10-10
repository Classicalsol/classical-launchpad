'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Cpu, ArrowUpRight, Menu, X } from 'lucide-react'
import { WalletButton } from '@/components/wallet-provider'
import { Button } from '@/components/ui/button'

const navigation = [{ href: '/', label: 'Overview' }, { href: '/discover', label: 'Launchpad' }, { href: '/proof', label: 'Proof Engine' }, { href: '/scanner', label: 'Security Scanner' }, { href: '/terminal', label: 'Compute' }, { href: '/docs', label: 'Docs' }]
export function Brand() { return <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Classical home"><Cpu className="size-7 text-primary" strokeWidth={1.5}/><span className="text-xl font-semibold tracking-[0.12em]">CLASSICAL<span className="text-primary">.</span></span></Link> }
export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return <header className="relative z-20 border-b border-border bg-background"><div className="shell flex min-h-20 items-center justify-between gap-6"><Brand/><nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">{navigation.map(n => <Link key={n.href} href={n.href} className="nav-link" data-active={pathname === n.href}>{n.label}{n.href === '/scanner' && <span className="status-dot"/>}</Link>)}</nav><div className="flex items-center gap-4"><span className="hidden items-center gap-2 font-mono text-sm text-muted-foreground xl:flex"><span className="status-dot"/>SOLANA</span><div className="hidden sm:block"><WalletButton/></div><Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</Button></div></div>{open && <nav aria-label="Mobile navigation" className="shell flex flex-col border-t border-border pb-5 lg:hidden">{navigation.map(n => <Link key={n.href} href={n.href} className="nav-link py-4" data-active={pathname === n.href} onClick={() => setOpen(false)}>{n.label}</Link>)}<WalletButton/></nav>}</header>
}
export function SiteFooter() { return <footer className="mt-20 border-t border-border"><div className="shell flex flex-col justify-between gap-8 py-10 md:flex-row md:items-center"><div className="flex flex-col gap-3"><Brand/><p className="font-mono text-sm text-muted-foreground">No theoretical promises. Real computation.</p></div><div className="flex flex-wrap gap-6 text-sm text-muted-foreground"><Link href="/docs" className="hover:text-primary">Documentation</Link><Link href="/explore" className="hover:text-primary">Classical vs. quantum</Link><Link href="/discover" className="hover:text-primary">Token discovery</Link><a href="https://solana.com/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">Solana docs<ArrowUpRight className="size-4"/></a></div></div><div className="shell flex flex-col justify-between gap-3 border-t border-border py-5 font-mono text-sm text-muted-foreground md:flex-row"><span>CLASSICAL / PROOF, NOT PROMISES.</span><span>On-chain findings are not a security audit or financial advice.</span></div></footer> }
