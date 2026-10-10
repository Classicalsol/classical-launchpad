import { z } from 'zod'
import { rpc, SolanaRpcError } from '@/lib/solana'
import { readBody, rateLimit, apiError } from '@/lib/api'
const schema = z.object({jsonrpc:z.literal('2.0'),id:z.union([z.string().max(100),z.number()]),method:z.enum(['getLatestBlockhash','getBlockHeight','getSignatureStatuses','getAccountInfo','getBalance','getMinimumBalanceForRentExemption','sendTransaction','simulateTransaction','getVersion']),params:z.array(z.unknown()).max(5).default([])})
export async function POST(request:Request) {
  let id: string | number | null = null
  try {const body = schema.parse(await readBody(request,12000)); id=body.id; await rateLimit(request,'rpc',60); const result = await rpc(body.method,body.params);return Response.json({jsonrpc:'2.0',id:body.id,result})}
  catch(error){
    if(error instanceof SolanaRpcError) return Response.json({jsonrpc:'2.0',id,error:{code:error.rpcCode,message:error.message}})
    return apiError(error)
  }
}
