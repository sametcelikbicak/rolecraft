import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { bundleApi } from './bundle.js'

// Dry runs exercise the API's input formats without installing any skills.
describe('bundle API', () => {
  it('preserves dry-run results for inline sources', async () => {
    assert.deepEqual(
      await bundleApi(['owner/one', 'owner/two'], { dryRun: true }),
      {
        dryRun: true,
        skills: ['owner/one', 'owner/two'],
      },
    )
    assert.deepEqual(await bundleApi('owner/one', { dryRun: true }), {
      dryRun: true,
      skills: ['owner/one'],
    })
    assert.deepEqual(await bundleApi([], { dryRun: true }), {
      installed: 0,
      failed: 0,
      results: [],
    })
  })

  it('accepts JSON arrays, JSON objects, and commented text bundles', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'rolecraft-bundle-api-'))
    try {
      for (const [name, content] of [
        ['array.json', '["owner/one","owner/two"]'],
        ['object.json', '{"skills":["owner/one","owner/two"]}'],
        ['list.txt', '# comment\n owner/one \n\nowner/two\n'],
      ]) {
        const file = join(directory, name)
        await writeFile(file, content)
        assert.deepEqual(await bundleApi(file, { dryRun: true }), {
          dryRun: true,
          skills: ['owner/one', 'owner/two'],
        })
      }
      const invalidFile = join(directory, 'invalid.json')
      await writeFile(invalidFile, '{"name":"missing skills"}')
      await assert.rejects(bundleApi(invalidFile), /JSON bundle must/)
      await assert.rejects(
        bundleApi(join(directory, 'missing.json')),
        /Bundle file not found/,
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
