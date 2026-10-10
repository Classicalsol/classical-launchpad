import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { launches } from '@/lib/db/schema'
import { rateLimit, readBody, apiError, ApiError } from '@/lib/api'
import { mintSchema, rpc, readMint, TOKEN_PROGRAM } from '@/lib/solana'
import { launchMessage, LAUNCH_DECIMALS, LAUNCH_SUPPLY_RAW } from '@/lib/launch-record'
const schema=z.object({mint:mintSchema,creator:mintSchema,signature:z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/),name:z.string().trim().min(1).max(32).regex(/^[\p{L}\p{N} ._-]+$/u),symbol:z.string().trim().min(1).max(10).regex(/^[A-Z0-9]+$/),authorization:z.string().max(100)})
type Instruction={programId:string;parsed?:{type:string;info:Record<string,unknown>}}
type ParsedTransaction={slot:number;blockTime:number|null;meta:{err:unknown;innerInstructions?:{instructions:Instruction[]}[]}|null;transaction:{message:{accountKeys:{pubkey:string;signer:boolean}[];instructions:Instruction[]}}}
export async function GET(request:Request) {try{await rateLimit(request,'launch-list',30);const rows=await db.select().from(launches).orderBy(desc(launches.createdAt)).limit(50);return Response.json({launches:rows})}catch(e){return apiError(e)}}
export async function POST(request:Request) {
  try {
    const data=schema.parse(await readBody(request));await rateLimit(request,'launch-register',10)
    let authorized=false
    try {const sig=bs58.decode(data.authorization);authorized=sig.length===64&&nacl.sign.detached.verify(new TextEncoder().encode(launchMessage(data)),sig,new PublicKey(data.creator).toBytes())}catch{}
    if(!authorized)throw new ApiError('The creator must sign the exact launch record.',401)
    const tx=await rpc<ParsedTransaction|null>('getTransaction',[data.signature,{encoding:'jsonParsed',commitment:'confirmed',maxSupportedTransactionVersion:0}])
    if(!tx||!tx.meta)throw new ApiError('This transaction is not visible at confirmed commitment. It may be pending, dropped, or expired. Recording cannot submit it. Keep this page open and inspect the transaction link before attempting another launch.',409)
    if(tx.meta.err!==null)throw new ApiError('The creation transaction failed on-chain. No token was created by it; a network fee may still have been charged. It cannot be recorded.',400)
    if(!tx.transaction.message.accountKeys.some(k=>k.signer&&k.pubkey===data.creator))throw new ApiError('Creator did not sign this transaction.',400)
    const instructions=[...tx.transaction.message.instructions,...(tx.meta.innerInstructions??[]).flatMap(i=>i.instructions)].filter(i=>i.programId===TOKEN_PROGRAM)
    const init=instructions.find(i=>['initializeMint','initializeMint2'].includes(i.parsed?.type??'')&&i.parsed?.info.mint===data.mint)
    if(!init||init.parsed?.info.mintAuthority!==data.creator||init.parsed?.info.freezeAuthority)throw new ApiError('This transaction does not initialize the claimed mint under the creator with no freeze authority.',400)
    const minted=instructions.filter(i=>i.parsed?.type==='mintTo'&&i.parsed.info.mint===data.mint&&i.parsed.info.mintAuthority===data.creator).reduce((sum,i)=>sum+BigInt(String(i.parsed!.info.amount)),0n)
    const mint=await readMint(data.mint,{minContextSlot:tx.slot})
    if(minted!==LAUNCH_SUPPLY_RAW||mint.decimals!==LAUNCH_DECIMALS)throw new ApiError('Launch supply is automatically fixed at 1,000,000,000 tokens. Custom supply is not supported.',400)
    if(minted<=0n||mint.program!==TOKEN_PROGRAM||mint.mintAuthority!==null||mint.freezeAuthority!==null)throw new ApiError('Record requires a funded legacy SPL mint with mint authority revoked and no freeze authority.',400)
    await db.insert(launches).values({mint:data.mint,signature:data.signature,creator:data.creator,name:data.name,symbol:data.symbol,supply:minted.toString(),decimals:mint.decimals,createdAt:tx.blockTime?new Date(tx.blockTime*1000):new Date()}).onConflictDoNothing()
    return Response.json({url:`/token/${data.mint}`},{status:201})
  }catch(e){return apiError(e)}
}
