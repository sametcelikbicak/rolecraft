import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

let tempDir, updateModule

before(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'rolecraft-update-test-'))
  process.env.HOME = tempDir

  await mkdir(join(tempDir, '.agents', 'skills', 'test-skill'), { recursive: true })
  writeFileSync(join(tempDir, '.agents', 'skills', 'test-skill', 'SKILL.md'), '# slug: test/skill\nname: Test Skill\nContent')

  const lockPath = join(tempDir, '.agents', '.skill-lock.json')
  await writeFile(lockPath, JSON.stringify({
    version: 3,
    skills: {
      'test/skill': {
        name: 'Test Skill',
        source: join(tempDir, 'source-skill'),
        sourceType: 'local',
        installedAt: new Date().toISOString(),
      },
    },
    dismissed: {},
    lastSelectedAgents: [],
  }))

  const sourceDir = join(tempDir, 'source-skill')
  mkdirSync(sourceDir, { recursive: true })
  writeFileSync(join(sourceDir, 'SKILL.md'), '# slug: test/skill\nname: Test Skill\nContent')

  updateModule = await import('./update.js')
})

after(async () => {
  await rm(tempDir, { recursive: true, force: true })
})

describe('update command', () => {
  it('updates an installed skill', async () => {
    const logs = []
    const origLog = console.log
    console.log = (...args) => {
      if (args.length) logs.push(String(args[0]))
    }

    await updateModule.updateCommand('test/skill')

    assert.ok(logs.some(l => l.includes('Updated')))
    console.log = origLog
  })

  it('exits with error when skill not found', async () => {
    const origExit = process.exit
    const origError = console.error
    const errors = []
    console.error = (msg) => errors.push(msg)
    process.exit = (code) => { throw new Error(`exit:${code}`) }

    await assert.rejects(
      () => updateModule.updateCommand('nonexistent'),
      /exit:1/,
    )

    assert.ok(errors.some(e => e.includes('not found')))
    process.exit = origExit
    console.error = origError
  })
})
