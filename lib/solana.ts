import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
export const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
export const mintSchema = z.string().trim().min(32).max(44).refine(value => { try {return new PublicKey(value).toBase58() === value} catch {return false} }, 'Enter a valid Solana mint address.')
export class SolanaRpcError extends ApiError {
  constructor(public readonly rpcCode: number, message: string) { super(message, 503) }
}
export async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const endpoint = process.env.SOLANA_RPC_URL?.trim() || 'https://api.mainnet-beta.solana.com'
  let response: Response
  try {
    response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(12000), cache: 'no-store' })
  } catch {
    throw new ApiError('Solana RPC could not be reached. Retry checking the existing transaction; its outcome is unknown.', 503)
  }
  if(!response.ok) throw new ApiError(`Solana RPC is unavailable (HTTP ${response.status}). Retry later; no on-chain conclusion can be drawn.`, 503)
  const data = await response.json()
  if(data.error) throw new SolanaRpcError(Number.isInteger(data.error.code) ? data.error.code : -32603, typeof data.error.message === 'string' ? data.error.message.slice(0, 500) : 'Solana RPC could not complete this request. Retry later; the transaction outcome is unknown.')
  return data.result as T
}
export type MintInfo = { decimals: number; supply: string; mintAuthority: string | null; freezeAuthority: string | null; isInitialized: boolean; extensions?: { extension: string; state?: unknown }[] }
export async function readMint(mint: string, options: { minContextSlot?: number } = {}) {
  const result = await rpc<{context: {slot: number}; value: null | {owner: string; data: {parsed?: {type: string; info: MintInfo}}}}>('getAccountInfo', [mint, { encoding: 'jsonParsed', commitment: 'confirmed', ...options }])
  if(options.minContextSlot !== undefined && result.context.slot < options.minContextSlot) throw new ApiError('The RPC node has not caught up with the creation transaction. Retry recording; do not launch again.', 409)
  if(!result.value) throw new ApiError(options.minContextSlot !== undefined ? 'The creation transaction was found, but its mint account is not available. Retry recording; do not launch again.' : 'No account is visible at this address on Solana mainnet. If it was just submitted, check its transaction status first.', options.minContextSlot !== undefined ? 409 : 404)
  if(![TOKEN_PROGRAM, TOKEN_2022_PROGRAM].includes(result.value.owner) || result.value.data.parsed?.type !== 'mint') throw new ApiError('This address exists but is not a supported SPL token mint.', 404)
  return { mint, slot: result.context.slot, program: result.value.owner, ...result.value.data.parsed.info }
}
export function displaySupply(amount: string, decimals: number) { const padded = amount.padStart(decimals + 1, '0'); return decimals ? `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`.replace(/\.?0+$/, '') : amount }
export async function readMetadata(mint: string) {
  const program = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const [address] = PublicKey.findProgramAddressSync([Buffer.from('metadata'), program.toBuffer(), new PublicKey(mint).toBuffer()], program)
  const result = await rpc<{value: null | {owner: string; data: [string, string]}}>('getAccountInfo', [address.toBase58(), {encoding:'base64', commitment:'confirmed'}])
  if(!result.value) return null
  if(result.value.owner !== program.toBase58()) throw new Error('Unexpected metadata owner')
  const bytes = Buffer.from(result.value.data[0], 'base64')
  if(bytes.length < 69 || bytes[0] !== 4 || new PublicKey(bytes.subarray(33,65)).toBase58() !== mint) throw new Error('Unsupported metadata layout')
  let offset = 65
  function readString() { const length = bytes.readUInt32LE(offset); offset += 4; if(length > 1000 || offset + length > bytes.length) throw new Error('Invalid metadata'); const value = bytes.subarray(offset, offset + length).toString('utf8').replace(/\0/g, ''); offset += length; return value }
  return { updateAuthority: new PublicKey(bytes.subarray(1,33)).toBase58(), name: readString(), symbol: readString() }
}
