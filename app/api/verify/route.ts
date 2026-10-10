import { VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { z } from 'zod'
import { rpc } from '@/lib/solana'
import { rateLimit, readBody, apiError, ApiError } from '@/lib/api'
const schema = z.object({ signature:z.string().min(80).max(90).refine(s => {try{return bs58.decode(s).length === 64}catch{return false}}, 'Enter a valid base58 Solana transaction signature.') })
export async function POST(request: Request) {
  try {
    const {signature} = schema.parse(await readBody(request))
    await rateLimit(request, 'verify')
    const result = await rpc<{slot:number; blockTime:number|null; meta:{err:unknown;fee:number}|null; transaction:[string,string]}|null>('getTransaction', [signature, {encoding:'base64', commitment:'confirmed', maxSupportedTransactionVersion:0}])
    if(!result) throw new ApiError('Transaction was not found at confirmed commitment. It may be pending, pruned, or on a different network.',404)
    const transaction = VersionedTransaction.deserialize(Buffer.from(result.transaction[0], 'base64'))
    if(bs58.encode(transaction.signatures[0]) !== signature) throw new ApiError('The RPC response does not match the requested transaction.',502)
    const message = transaction.message.serialize()
    const signatures = transaction.signatures.map((sig, index) => ({ signer: transaction.message.staticAccountKeys[index].toBase58(), verified: nacl.sign.detached.verify(message, sig, transaction.message.staticAccountKeys[index].toBytes()) }))
    return Response.json({signature, slot: result.slot, blockTime: result.blockTime, executionSucceeded: result.meta ? result.meta.err === null : null, fee: result.meta?.fee ?? null, signatures, commitment:'confirmed', source:'Solana mainnet public RPC', limitation:'Signatures are verified locally on the server against the returned message bytes. Slot and execution metadata are RPC-reported; this is not an independently verified consensus or block-inclusion proof.'})
  } catch(error) {return apiError(error)}
}
