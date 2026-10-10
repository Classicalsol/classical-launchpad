'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
export function ScannerEntry() {
  const [mint, setMint] = useState('')
  const router = useRouter()
  return <form onSubmit={e => { e.preventDefault(); if(mint.trim()) router.push(`/scanner?mint=${encodeURIComponent(mint.trim())}`) }}><Field><FieldLabel htmlFor="home-mint" className="sr-only">Solana token mint address</FieldLabel><div className="flex gap-2"><Input id="home-mint" value={mint} onChange={e => setMint(e.target.value)} placeholder="Paste a Solana token address…" maxLength={44} required className="min-h-11 min-w-0"/><Button type="submit" className="min-h-11">Scan token<ArrowRight data-icon="inline-end"/></Button></div></Field></form>
}
