'use client'

import { useMemo, useState } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { Wallet, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])
  const endpoint = typeof window === 'undefined' ? 'https://api.mainnet-beta.solana.com' : `${window.location.origin}/api/rpc`
  return <ConnectionProvider endpoint={endpoint}><WalletProvider wallets={wallets} autoConnect={false}>{children}</WalletProvider></ConnectionProvider>
}

export function WalletButton() {
  const { wallets, select, publicKey, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function connectWallet(wallet: (typeof wallets)[number]) {
    setError(''); setPending(true)
    try {
      select(wallet.adapter.name)
      await wallet.adapter.connect()
      setOpen(false)
    } catch (e) { setError(e instanceof Error ? e.message : 'Wallet connection was declined.') }
    finally { setPending(false) }
  }
  return <>
    <Button variant="outline" onClick={() => setOpen(true)}><Wallet data-icon="inline-start" />{publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : 'Connect wallet'}</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{publicKey ? 'Connected wallet' : 'Connect to Classical'}</DialogTitle><DialogDescription>Solana mainnet. Keys stay in your wallet. Classical never asks for a seed phrase.</DialogDescription></DialogHeader>
      {publicKey ? <div className="flex flex-col gap-5"><p className="break-all font-mono text-sm">{publicKey.toBase58()}</p><Button variant="outline" onClick={async () => { await disconnect(); setOpen(false) }}><X />Disconnect</Button></div> : <div className="flex flex-col gap-3">{wallets.map(w => <Button key={w.adapter.name} variant="outline" disabled={pending} onClick={() => connectWallet(w)}>{w.adapter.name}<ExternalLink data-icon="inline-end" /></Button>)}</div>}
      {error && <p role="alert" className="text-sm text-primary">{error}</p>}
    </DialogContent></Dialog>
  </>
}
