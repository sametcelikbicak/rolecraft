import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadBundleSources, installBundleSources } from './bundle-internal.js'

describe('installBundleSources', () => {
  it('calls onStart callback for each source', async () => {
    const sources = ['owner/one', 'owner/two', 'owner/three']
    const started = []

    await installBundleSources(
      sources,
      {},
      {
        onStart: (source, index) => started.push({ source, index }),
      },
    )

    assert.equal(started.length, 3)
    assert.deepEqual(started[0], { source: 'owner/one', index: 0 })
    assert.deepEqual(started[1], { source: 'owner/two', index: 1 })
    assert.deepEqual(started[2], { source: 'owner/three', index: 2 })
  })

  it('calls onError callback when install fails', async () => {
    const sources = ['owner/fail1', 'owner/fail2']
    const errors = []

    const result = await installBundleSources(
      sources,
      {},
      {
        onError: (source, error) => errors.push({ source, error }),
      },
    )

    assert.equal(result.installed, 0)
    assert.equal(result.failed, 2)
    assert.equal(errors.length, 2)
    assert.equal(errors[0].source, 'owner/fail1')
    assert.ok(errors[0].error instanceof Error)
    assert.equal(errors[1].source, 'owner/fail2')
  })

  it('passes yes and noMcp options to install', async () => {
    const sources = ['owner/fail']

    const result = await installBundleSources(
      sources,
      { yes: true, noMcp: true },
      {},
    )

    assert.equal(result.results.length, 1)
    assert.equal(result.results[0].status, 'failed')
  })
})

describe('loadBundleSources', () => {
  it('returns array sources directly', async () => {
    const result = await loadBundleSources(['owner/one', 'owner/two'])
    assert.deepEqual(result, {
      sources: ['owner/one', 'owner/two'],
      filePath: null,
    })
  })

  it('wraps bare string as single-element array', async () => {
    const result = await loadBundleSources('owner/one')
    assert.deepEqual(result, {
      sources: ['owner/one'],
      filePath: null,
    })
  })
})
