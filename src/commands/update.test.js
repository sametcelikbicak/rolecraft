import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises'
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

  it('updates a project-scoped skill via projectFound branch', async () => {
    const origCwd = process.cwd
    process.cwd = () => tempDir

    await mkdir(join(tempDir, '.agents'), { recursive: true })
    await writeFile(join(tempDir, '.agents', '.skill-lock.json'), JSON.stringify({
      version: 3,
      skills: {
        'proj/skill': {
          name: 'Project Skill',
          source: join(tempDir, 'proj-source'),
          sourceType: 'local',
          installedAt: new Date().toISOString(),
        },
      },
      dismissed: {},
      lastSelectedAgents: [],
    }))

    await mkdir(join(tempDir, '.agents', 'skills', 'proj-skill'), { recursive: true })
    writeFileSync(join(tempDir, '.agents', 'skills', 'proj-skill', 'SKILL.md'), '# slug: proj/skill\nname: Project Skill\nContent')

    mkdirSync(join(tempDir, 'proj-source'), { recursive: true })
    writeFileSync(join(tempDir, 'proj-source', 'SKILL.md'), '# slug: proj/skill\nname: Project Skill\nContent')

    const logs = []
    const origLog = console.log
    console.log = (...args) => {
      if (args.length) logs.push(String(args[0]))
    }

    await updateModule.updateCommand('proj/skill')

    assert.ok(logs.some(l => l.includes('Updated')))
    console.log = origLog
    process.cwd = origCwd
  })

  it('falls back to agents target when no existing targets detected', async () => {
    const lockPath = join(tempDir, '.agents', '.skill-lock.json')
    const lock = JSON.parse(await readFile(lockPath, 'utf-8'))
    lock.skills['fresh/skill'] = {
      name: 'Fresh Skill',
      source: join(tempDir, 'fresh-source'),
      sourceType: 'local',
      installedAt: new Date().toISOString(),
    }
    await writeFile(lockPath, JSON.stringify(lock, null, 2))

    mkdirSync(join(tempDir, 'fresh-source'), { recursive: true })
    writeFileSync(join(tempDir, 'fresh-source', 'SKILL.md'), '# slug: fresh/skill\nname: Fresh Skill\nContent')

    const logs = []
    const origLog = console.log
    console.log = (...args) => {
      if (args.length) logs.push(String(args[0]))
    }

    await updateModule.updateCommand('fresh/skill')

    assert.ok(logs.some(l => l.includes('Updated')))
    console.log = origLog
  })
})
