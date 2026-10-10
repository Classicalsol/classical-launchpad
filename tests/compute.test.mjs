import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { webcrypto, createHash } from 'node:crypto'
import vm from 'node:vm'
const source = await readFile(new URL('../public/compute-worker.js', import.meta.url), 'utf8')
async function compute(algorithm, input) {
  let result
  const self = {postMessage(value) {result = value}}
  const context = vm.createContext({self, crypto:webcrypto, performance, TextEncoder, TextDecoder, Uint8Array})
  vm.runInContext(source, context)
  await self.onmessage({data:{algorithm,input}})
  return result
}
test('SHA-256 uses the known abc test vector',async()=>{const r=await compute('sha256','abc');assert.equal(r.output,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');assert.equal(r.operations,3);assert.ok(r.elapsed>=0)})
test('prime sieve finds all primes through 30',async()=>{const r=await compute('primes','30');assert.equal(r.output,'10 primes ≤ 30\n2, 3, 5, 7, 11, 13, 17, 19, 23, 29')})
test('merge sort handles duplicates and negatives',async()=>{const r=await compute('sort','4,-1,4,0,2');assert.equal(r.output,'-1, 0, 2, 4, 4')})
test('binary conversion uses UTF-8 bytes',async()=>{const r=await compute('binary','A');assert.equal(r.output,'01000001')})
test('Merkle tree hashes domain separated byte pairs',async()=>{const r=await compute('merkle','Alice\nBob\nCharlie');const hash=b=>createHash('sha256').update(b).digest();const leaves=['Alice','Bob','Charlie'].map(s=>hash(Buffer.concat([Buffer.from([0]),Buffer.from(s)])));const left=hash(Buffer.concat([Buffer.from([1]),leaves[0],leaves[1]]));const right=hash(Buffer.concat([Buffer.from([1]),leaves[2],leaves[2]]));const root=hash(Buffer.concat([Buffer.from([1]),left,right])).toString('hex');assert.equal(r.layers.at(-1)[0],root);assert.equal(r.operations,6)})
test('AES-GCM performs a successful authenticated round trip',async()=>{const r=await compute('aes','Proof, not promises.');assert.match(r.output,/Decrypted: Proof, not promises\./);assert.match(r.output,/Round trip: MATCH/)})
test('out-of-range work and arbitrary execution are rejected',async()=>{assert.ok((await compute('primes','1000001')).error);assert.ok((await compute('eval','alert(1)')).error);assert.ok((await compute('merkle',Array(17).fill('x').join('\n'))).error);assert.ok((await compute('sort','2,not-a-number')).error)})
