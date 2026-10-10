import { rateLimit, apiError, ApiError } from '@/lib/api'
import { z } from 'zod'
export async function GET(request:Request) {
  try {
    const q=z.string().trim().min(1).max(64).parse(new URL(request.url).searchParams.get('q')??'SOL')
    await rateLimit(request,'markets',30)
    const response=await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,{next:{revalidate:30},signal:AbortSignal.timeout(12000)})
    if(!response.ok)throw new ApiError('The market data provider is unavailable. No prices or activity have been substituted.',503)
    const data=await response.json()
    const pairs=(Array.isArray(data.pairs)?data.pairs:[]).filter((p:{chainId:string})=>p.chainId==='solana').slice(0,20)
    return Response.json({pairs,source:'DEX Screener',fetchedAt:new Date().toISOString()})
  }catch(e){return apiError(e)}
}
