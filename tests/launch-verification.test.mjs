import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

const require = createRequire(import.meta.url)
class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}
const api = {
  ApiError,
  readBody: request => request.json(),
  rateLimit: async () => {},
  apiError: error => Response.json({ error: error.message }, { status: error.status || 500 }),
}
async function load(path, mocks = {}, globals = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } })
  const exports = {}
  vm.runInNewContext(outputText, { exports, require: name => mocks[name] ?? require(name), Response, TextEncoder, Buffer, AbortSignal, process: { env: {} }, ...globals })
  return exports
}
const records = await load('../lib/launch-record.ts')
function signedReceipt() {
  const key = nacl.sign.keyPair()
  const data = { mint: bs58.encode(nacl.sign.keyPair().publicKey), creator: bs58.encode(key.publicKey), signature: bs58.encode(nacl.randomBytes(64)), name: 'Regression', symbol: 'TEST' }
  return { ...data, authorization: bs58.encode(nacl.sign.detached(new TextEncoder().encode(records.launchMessage(data)), key.secretKey)) }
}
const request = data => new Request('http://localhost/api/launches', { method: 'POST', body: JSON.stringify(data) })
const program = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

async function registration(tx, mint, calls) {
  const solana = await load('../lib/solana.ts', { '@/lib/api': api })
  return load('../app/api/launches/route.ts', {
    '@/lib/api': api,
    '@/lib/launch-record': records,
    '@/lib/db/schema': { launches: {} },
    '@/lib/db': { db: { insert: () => ({ values: () => ({ onConflictDoNothing: async () => { calls.push('insert') } }) }) } },
    '@/lib/solana': { ...solana, rpc: async method => { calls.push(method); return tx }, readMint: async (address, options) => { calls.push(['mint', address, options.minContextSlot]); return mint } },
  })
}
test('missing transaction never reads a mint or writes a launch', async () => {
  const calls = []
  const { POST } = await registration(null, null, calls)
  const response = await POST(request(signedReceipt()))
  assert.equal(response.status, 409)
  assert.match((await response.json()).error, /pending, dropped, or expired/)
  assert.deepEqual(calls, ['getTransaction'])
})
test('failed transaction is reported before any mint lookup', async () => {
  const calls = []
  const { POST } = await registration({ meta: { err: { InstructionError: [0, 'InsufficientFunds'] } } }, null, calls)
  const response = await POST(request(signedReceipt()))
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /failed on-chain/)
  assert.deepEqual(calls, ['getTransaction'])
})
test('confirmed valid creation reads at least the transaction slot and records once', async () => {
  const data = signedReceipt()
  const calls = []
  const tx = { slot: 1234, blockTime: 1700000000, meta: { err: null }, transaction: { message: { accountKeys: [{ pubkey: data.creator, signer: true }], instructions: [
    { programId: program, parsed: { type: 'initializeMint2', info: { mint: data.mint, mintAuthority: data.creator, freezeAuthority: null } } },
    { programId: program, parsed: { type: 'mintTo', info: { mint: data.mint, mintAuthority: data.creator, amount: records.LAUNCH_SUPPLY_RAW.toString() } } },
  ] } } }
  const mint = { program, decimals: records.LAUNCH_DECIMALS, mintAuthority: null, freezeAuthority: null }
  const { POST } = await registration(tx, mint, calls)
  const response = await POST(request(data))
  assert.equal(response.status, 201)
  assert.equal((await response.json()).url, `/token/${data.mint}`)
  assert.deepEqual(calls, ['getTransaction', ['mint', data.mint, 1234], 'insert'])
})
test('invalid authorization never reaches RPC', async () => {
  const calls = []
  const { POST } = await registration(null, null, calls)
  const response = await POST(request({ ...signedReceipt(), authorization: bs58.encode(nacl.randomBytes(64)) }))
  assert.equal(response.status, 401)
  assert.deepEqual(calls, [])
})
test('missing and lagging mint reads are retryable, wrong owners remain invalid', async () => {
  let value = null
  let slot = 100
  let params
  const solana = await load('../lib/solana.ts', { '@/lib/api': api }, { fetch: async (_url, options) => {
    params = JSON.parse(options.body).params
    return Response.json({ result: { context: { slot }, value } })
  } })
  await assert.rejects(solana.readMint('mint', { minContextSlot: 100 }), e => e.status === 409 && /not available/.test(e.message))
  assert.equal(params[1].minContextSlot, 100)
  slot = 99
  await assert.rejects(solana.readMint('mint', { minContextSlot: 100 }), e => e.status === 409 && /caught up/.test(e.message))
  slot = 100
  value = { owner: '11111111111111111111111111111111', data: {} }
  await assert.rejects(solana.readMint('mint', { minContextSlot: 100 }), e => e.status === 404 && /exists but/.test(e.message))
})
test('RPC uses the configured endpoint without exposing it on transport failure', async () => {
  const endpoint = 'https://rpc.example.test/?api-key=test-only'
  let called
  let fail = false
  const solana = await load('../lib/solana.ts', { '@/lib/api': api }, {
    process: { env: { SOLANA_RPC_URL: endpoint } },
    fetch: async url => {
      called = url
      if (fail) throw new Error(`Failed to fetch ${url}`)
      return Response.json({ result: 123 })
    },
  })
  assert.equal(await solana.rpc('getSlot', []), 123)
  assert.equal(called, endpoint)
  fail = true
  await assert.rejects(solana.rpc('getSlot', []), e => e.status === 503 && !e.message.includes(endpoint) && /outcome is unknown/.test(e.message))
})
test('RPC proxy keeps preflight error code, message, and request ID', async () => {
  const solana = await load('../lib/solana.ts', { '@/lib/api': api }, { fetch: async () => Response.json({ error: { code: -32002, message: 'Transaction simulation failed: Blockhash not found' } }) })
  const { POST } = await load('../app/api/rpc/route.ts', { '@/lib/api': api, '@/lib/solana': solana })
  const response = await POST(request({ jsonrpc: '2.0', id: 'wallet-123', method: 'sendTransaction', params: ['test-only'] }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { jsonrpc: '2.0', id: 'wallet-123', error: { code: -32002, message: 'Transaction simulation failed: Blockhash not found' } })
})
