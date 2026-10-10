import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const source = await readFile(new URL('../lib/token-experiments.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { fingerprint, hashBits, applyGate, measureQubit, tokenExperimentInput, experimentReport } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const close = (actual, expected) => actual.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < 1e-12))

test('fingerprint is SHA-256 and the mutation flips exactly one input bit', async () => {
  const result = await fingerprint('abc')
  assert.equal(result.hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  assert.equal(result.flippedHash, createHash('sha256').update(Buffer.from([0x60, 0x62, 0x63])).digest('hex'))
  assert.equal(result.bits.length, 256)
  assert.equal(result.changedBits, result.bits.filter((bit, index) => bit !== result.flippedBits[index]).length)
  assert.deepEqual(hashBits('a0'), [1, 0, 1, 0, 0, 0, 0, 0])
  assert.deepEqual(await fingerprint('abc'), result)
  await assert.rejects(fingerprint(''))
})

test('fingerprint input separates registered records and reports retain exact inputs', async () => {
  const input = tokenExperimentInput('mint', 'signature')
  assert.equal(input, 'classical:token-lab:v1\nmint:mint\ntransaction:signature')
  assert.notEqual(input, tokenExperimentInput('mint'))
  const result = await fingerprint(input)
  const report = experimentReport(result, 'registered')
  assert.equal(report.input, input)
  assert.equal(report.fingerprint, result.hash)
  assert.match(report.notice, /unsigned/)
})

test('H H restores either basis state and H Z H flips it', () => {
  for (const state of [[1, 0], [0, 1]]) {
    const h = applyGate(state, 'H')
    assert.ok(Math.abs(h[0] ** 2 - 0.5) < 1e-12)
    close(applyGate(h, 'H'), state)
    close(applyGate(applyGate(h, 'Z'), 'H'), [state[1], state[0]])
    close(applyGate(applyGate(state, 'X'), 'X'), state)
    close(applyGate(applyGate(state, 'Z'), 'Z'), state)
  }
})

test('gates preserve normalization and measurement obeys probabilities', () => {
  let state = [1, 0]
  for (let i = 0; i < 1000; i++) state = applyGate(state, ['H', 'Z', 'X'][i % 3])
  assert.ok(Math.abs(state[0] ** 2 + state[1] ** 2 - 1) < 1e-12)
  const superposition = applyGate([1, 0], 'H')
  assert.equal(measureQubit(superposition, 0.1), 0)
  assert.equal(measureQubit(superposition, 0.9), 1)
  assert.equal(measureQubit([1, 0], 0.9999999), 0)
  assert.equal(measureQubit([0, 1], 0), 1)
  for (const sample of [-1, 1, NaN]) assert.throws(() => measureQubit([1, 0], sample))
})
