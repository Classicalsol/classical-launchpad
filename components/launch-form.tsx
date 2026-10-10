'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useConnection,useWallet } from '@solana/wallet-adapter-react'
import { Keypair,SystemProgram,Transaction } from '@solana/web3.js'
import { MINT_SIZE,TOKEN_PROGRAM_ID,AuthorityType,createInitializeMint2Instruction,getAssociatedTokenAddressSync,createAssociatedTokenAccountInstruction,createMintToInstruction,createSetAuthorityInstruction } from '@solana/spl-token'
import bs58 from 'bs58'
import { Rocket,LoaderCircle,TriangleAlert,ExternalLink } from 'lucide-react'
import { Field,FieldGroup,FieldLabel,FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert,AlertTitle,AlertDescription } from '@/components/ui/alert'
import { WalletButton } from '@/components/wallet-provider'
import { TokenLab } from '@/components/token-lab'
import { launchMessage,LAUNCH_SUPPLY,LAUNCH_DECIMALS,LAUNCH_SUPPLY_RAW,type LaunchReceipt } from '@/lib/launch-record'
type SignedReceipt=LaunchReceipt&{authorization:string}
export function LaunchForm() {
  const {connection}=useConnection();const {publicKey,signTransaction,signMessage}=useWallet()
  const [name,setName]=useState('');const [symbol,setSymbol]=useState('');const [accepted,setAccepted]=useState(false)
  const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const [error,setError]=useState('');const [receipt,setReceipt]=useState<SignedReceipt|null>(null);const [url,setUrl]=useState('')
  async function register(value:SignedReceipt) {
    setStatus('Checking the existing transaction. This does not submit a transaction or spend SOL.')
    try {
      const r=await fetch('/api/launches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)})
      const data=await r.json()
      if(!r.ok)throw new Error(data.error || 'Could not verify the launch. Keep this receipt and retry recording.')
      setUrl(data.url);setStatus('Launch confirmed. Public proof record created.')
    } catch(e) {
      setStatus('Recording did not complete. Keep this page open and inspect the existing transaction before attempting another launch.')
      throw e
    }
  }
  async function launch() {
    if(!publicKey||!signTransaction||!signMessage){setError('Connect a wallet that supports transaction and message signing.');return}
    if(!/^[\p{L}\p{N} ._-]{1,32}$/u.test(name.trim())||!/^[A-Z0-9]{1,10}$/.test(symbol)){setError('Use a 1–32 character name and a 1–10 uppercase alphanumeric symbol. Supply is set automatically.');return}
    setBusy(true);setError('')
    try {
      setStatus('Preparing a mainnet transaction. No funds have been spent.')
      const mint=Keypair.generate();const ata=getAssociatedTokenAddressSync(mint.publicKey,publicKey)
      const rent=await connection.getMinimumBalanceForRentExemption(MINT_SIZE)
      const latest=await connection.getLatestBlockhash('confirmed')
      const tx=new Transaction({feePayer:publicKey,...latest}).add(
        SystemProgram.createAccount({fromPubkey:publicKey,newAccountPubkey:mint.publicKey,space:MINT_SIZE,lamports:rent,programId:TOKEN_PROGRAM_ID}),
        createInitializeMint2Instruction(mint.publicKey,LAUNCH_DECIMALS,publicKey,null),
        createAssociatedTokenAccountInstruction(publicKey,ata,publicKey,mint.publicKey),
        createMintToInstruction(mint.publicKey,ata,publicKey,LAUNCH_SUPPLY_RAW),
        createSetAuthorityInstruction(mint.publicKey,publicKey,AuthorityType.MintTokens,null),
      )
      tx.partialSign(mint)
      setStatus('Review and sign the token creation transaction in your wallet.')
      const signed=await signTransaction(tx)
      if(!signed.signature)throw new Error('Wallet returned an unsigned transaction.')
      const value:LaunchReceipt={mint:mint.publicKey.toBase58(),creator:publicKey.toBase58(),signature:bs58.encode(signed.signature),name:name.trim(),symbol}
      setStatus('Sign the public record authorization. This second signature does not transfer assets.')
      const authorization=bs58.encode(await signMessage(new TextEncoder().encode(launchMessage(value))))
      const full={...value,authorization};setReceipt(full)
      setStatus('Submitting your signed mainnet transaction. Do not launch again while confirmation is pending.')
      if(await connection.getBlockHeight('confirmed') > latest.lastValidBlockHeight) {
        throw new Error('The transaction expired during wallet approval and was not submitted by this page. Keep the receipt and inspect its transaction link before attempting another launch.')
      }
      await connection.sendRawTransaction(signed.serialize(),{skipPreflight:false,preflightCommitment:'confirmed',maxRetries:3})
      setStatus('Transaction submitted. Waiting for mainnet confirmation; do not launch again.')
      let confirmed=false
      for(let attempt=0;attempt<35;attempt++) {
        const result=await connection.getSignatureStatuses([value.signature],{searchTransactionHistory:true})
        const state=result.value[0]
        if(state?.err)throw new Error('Transaction execution failed. Inspect the transaction link for the chain-reported error.')
        if(state?.confirmationStatus==='confirmed'||state?.confirmationStatus==='finalized'){confirmed=true;break}
        await new Promise(resolve=>setTimeout(resolve,1600))
      }
      if(!confirmed)throw new Error('Confirmation is still pending. Keep this receipt and retry recording below. Do not submit another launch.')
      setStatus('Checking creation instructions and storing the verified launch record…')
      await register(full)
    }catch(e){setStatus('Launch flow stopped. If a transaction receipt is shown below, keep this page open and check it before attempting another launch.');setError(e instanceof Error?e.message:'Launch could not complete.')}finally{setBusy(false)}
  }
  return <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]"><div className="panel flex flex-col gap-6 p-6 md:p-8"><div className="flex items-center justify-between gap-4"><h2 className="text-xl">Create an SPL token</h2><WalletButton/></div><form onSubmit={e=>{e.preventDefault();void launch()}} className="flex flex-col gap-6"><FieldGroup><Field><FieldLabel htmlFor="token-name">Token name</FieldLabel><Input id="token-name" placeholder="e.g. Classical Compute" value={name} onChange={e=>setName(e.target.value)} maxLength={32} required disabled={busy||!!receipt}/></Field><Field><FieldLabel htmlFor="symbol">Ticker symbol</FieldLabel><Input id="symbol" placeholder="e.g. CCPU" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} maxLength={10} pattern="[A-Z0-9]+" required disabled={busy||!!receipt}/></Field><Field><p className="text-sm font-medium">Total supply · Automatic</p><p className="font-mono text-xl text-primary">{LAUNCH_SUPPLY.toLocaleString('en-US')} tokens</p><FieldDescription>Fixed for every launch. No supply setting needed. Entire supply goes to your wallet; mint authority is revoked in the same transaction.</FieldDescription></Field><Field orientation="horizontal"><input type="checkbox" id="risk" checked={accepted} onChange={e=>setAccepted(e.target.checked)} className="size-4 accent-primary" required disabled={busy||!!receipt}/><FieldLabel htmlFor="risk">I understand this spends real SOL and does not create a trading pool.</FieldLabel></Field></FieldGroup>{!receipt&&<Button type="submit" disabled={!publicKey||!accepted||busy} className="min-h-11">{busy?<LoaderCircle className="animate-spin"/>:<Rocket/>}{busy?'Awaiting wallet / chain':'Create token on mainnet'}</Button>}</form><p className="text-sm leading-relaxed text-muted-foreground">Every registered launch gets a SHA-256 fingerprint, a bit-flip experiment, and a quantum-gate simulator in its workspace. <Link href="/docs#token-lab" className="text-primary hover:underline">Read the field guide →</Link></p>{url&&receipt&&<TokenLab mint={receipt.mint} signature={receipt.signature} mode="registered" compact/>}{status&&<p role="status" className="font-mono text-sm leading-relaxed text-primary">{status}</p>}{error&&<Alert variant="destructive"><TriangleAlert/><AlertTitle>Action needs attention</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}{receipt&&<div className="flex flex-col gap-4 border-t border-border pt-5"><p className="break-all font-mono text-sm">Mint: {receipt.mint}</p><a href={`https://solscan.io/tx/${receipt.signature}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary">Inspect submitted transaction<ExternalLink className="size-4"/></a>{url?<Link className="action" href={url}>Open Proof of Launch<ExternalLink className="size-4"/></Link>:<Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await register(receipt)}catch(e){setError(e instanceof Error?e.message:'Recording failed.')}finally{setBusy(false)}}}>Retry recording existing transaction</Button>}</div>}</div><aside className="flex flex-col gap-5"><div className="panel p-6"><span className="eyebrow text-primary">PROOF OF LAUNCH</span><h2 className="mt-3 text-2xl">Created transparently.</h2><dl className="mt-5"><div className="data-row"><dt>Network</dt><dd>Solana mainnet</dd></div><div className="data-row"><dt>Token standard</dt><dd>Legacy SPL Token</dd></div><div className="data-row"><dt>Platform fee</dt><dd>0 SOL</dd></div><div className="data-row"><dt>Network costs</dt><dd>Actual rent + transaction fee</dd></div><div className="data-row"><dt>Mint authority</dt><dd>Revoked at creation</dd></div><div className="data-row"><dt>Freeze authority</dt><dd>None</dd></div><div className="data-row"><dt>Initial allocation</dt><dd>100% creator wallet</dd></div></dl><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Review exact costs in your wallet before signing. Rent and network fees are paid to Solana, not Classical.</p></div><Alert><AlertTitle>Display labels, not on-chain metadata</AlertTitle><AlertDescription>Name and symbol are creator-signed registry labels. This version does not install Metaplex metadata, upload token artwork, or create an on-chain metadata update authority.</AlertDescription></Alert><Alert><TriangleAlert/><AlertTitle>Trading program not configured</AlertTitle><AlertDescription>Native bonding curves, automated liquidity, and graduation are unavailable. They require a deployed, reviewed curve program, reserve custody rules, pool integration, and graduation instructions. Creating a token does not make it tradeable.</AlertDescription></Alert></aside></div>
}
