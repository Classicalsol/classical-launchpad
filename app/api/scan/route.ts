import { rateLimit, apiError } from '@/lib/api'
import { mintSchema, readMint, readMetadata, rpc, displaySupply, TOKEN_2022_PROGRAM } from '@/lib/solana'
export const maxDuration = 45
export async function GET(request: Request) {
  try {
    const mint = mintSchema.parse(new URL(request.url).searchParams.get('mint'))
    await rateLimit(request, 'scan', 10)
    const token = await readMint(mint)
    const [holders, metadata] = await Promise.allSettled([
      rpc<{value: {address: string; amount: string}[]}>('getTokenLargestAccounts', [mint, {commitment:'confirmed'}]),
      readMetadata(mint),
    ])
    const findings: { title: string; status: 'observed' | 'attention' | 'unknown'; detail: string }[] = [
      { title: 'Mint authority', status: token.mintAuthority ? 'attention' : 'observed', detail: token.mintAuthority ? `Active: ${token.mintAuthority}. This authority can issue additional tokens.` : 'No mint authority is set. The standard mint instruction cannot issue additional supply.' },
      { title: 'Freeze authority', status: token.freezeAuthority ? 'attention' : 'observed', detail: token.freezeAuthority ? `Active: ${token.freezeAuthority}. This authority can freeze token accounts.` : 'No freeze authority is set. Standard account freezing is unavailable.' },
      { title: 'Token program', status:'observed', detail: token.program === TOKEN_2022_PROGRAM ? 'Token-2022 mint. Extension permissions require additional review.' : 'Legacy SPL Token program. Token-2022 extensions do not apply.' },
    ]
    let largestAccounts: {address: string; amount: string; share: number}[] = []
    if(holders.status === 'fulfilled') {
      largestAccounts = holders.value.value.map(a => ({ ...a, share: BigInt(token.supply) > 0n ? Number(BigInt(a.amount) * 1000000n / BigInt(token.supply)) / 10000 : 0 }))
      const combined = largestAccounts.reduce((sum,a) => sum+a.share, 0)
      findings.push({ title:'Largest token accounts', status:combined > 50 ? 'attention' : 'observed', detail:`The ${largestAccounts.length} largest token accounts hold ${combined.toFixed(2)}% of supply. These are accounts, not distinct owners; liquidity pools, escrows, and exchanges may be included. A concentration flag is not proof of malicious ownership.` })
    } else findings.push({title:'Holder concentration', status:'unknown', detail:'The RPC did not return largest token accounts. Concentration and owner attribution could not be assessed.'})
    const extensions = token.extensions ?? []
    if(token.program === TOKEN_2022_PROGRAM) {
      findings.push({title:'Token-2022 extensions', status: extensions.length ? 'attention' : 'unknown', detail: extensions.length ? `RPC-reported extensions: ${extensions.map(x => x.extension).join(', ')}. Transfer fees, transfer hooks, non-transferability, default account state, and permanent delegates may restrict transfers. Configuration is provided below; hook behavior has not been audited.` : 'No extensions were exposed by this RPC response. This does not establish the absence of transfer restrictions; binary TLV parsing and transfer simulation have not been performed.'})
    }
    findings.push({ title:'Metadata authority', status: metadata.status === 'fulfilled' && metadata.value ? 'observed' : 'unknown', detail: metadata.status === 'fulfilled' && metadata.value ? `Metaplex update-authority field: ${metadata.value.updateAuthority}. Mutability and alternate metadata programs have not been evaluated.` : 'No supported Metaplex metadata account could be verified. Token-2022 metadata pointers and other metadata programs are not resolved.' })
    findings.push({title:'Distribution attribution', status:'unknown', detail:'Common-control wallet clusters, bundled launches, insider relationships, and historical transfers are not analyzed. No suspicious-distribution conclusion is made.'})
    findings.push({title:'Liquidity & bonding curve', status:'unknown', detail:'Pool ownership, LP locks, reserves, curve configuration, sellability, and graduation are not verified by this scan. A price feed alone is not proof of liquidity safety.'})
    return Response.json({ ...token, displaySupply: displaySupply(token.supply, token.decimals), metadata: metadata.status === 'fulfilled' ? metadata.value : null, largestAccounts, findings, checkedAt: new Date().toISOString(), source:'Solana mainnet public RPC', commitment:'confirmed' }, {headers:{'Cache-Control':'no-store'}})
  } catch(error) { return apiError(error) }
}
