import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { apiInstallSkills } from './install.js'
import { expandTilde } from '../utils/paths.js'

function parseSources(raw, filePath) {
  if (filePath.endsWith('.json')) {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed.skills && Array.isArray(parsed.skills)) return parsed.skills
    throw new Error(
      'JSON bundle must be an array of sources or an object with a "skills" array',
    )
  }

  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
}

async function resolveBundleFile(arg) {
  const isFilePath =
    arg.endsWith('.json') ||
    arg.endsWith('.txt') ||
    arg.startsWith('./') ||
    arg.startsWith('../') ||
    arg.startsWith('/') ||
    arg.startsWith('~')
  if (isFilePath) {
    const resolvedPath = expandTilde(arg, process.env.HOME || '/tmp')
    for (const candidate of [resolvedPath, join(process.cwd(), arg)]) {
      try {
        await readFile(candidate, 'utf-8')
        return candidate
      } catch {}
    }
    throw new Error(`Bundle file not found: ${arg}`)
  }

  const candidates = [
    arg,
    join(process.cwd(), arg),
    `${arg}.json`,
    `${arg}.txt`,
    join(process.cwd(), `${arg}.json`),
    join(process.cwd(), `${arg}.txt`),
  ]

  for (const candidate of candidates) {
    try {
      await readFile(candidate, 'utf-8')
      return candidate
    } catch {}
  }
  return null
}

export async function loadBundleSources(sources) {
  if (typeof sources !== 'string') return { sources, filePath: null }
  const filePath = await resolveBundleFile(sources)
  if (!filePath) return { sources: [sources], filePath: null }
  const raw = await readFile(filePath, 'utf-8')
  return { sources: parseSources(raw, filePath), filePath }
}

export async function installBundleSources(
  sources,
  options = {},
  callbacks = {},
) {
  const results = []
  const installOpts = {
    scope: { global: true, project: true },
    yes: options.yes ?? false,
    noMcp: options.noMcp ?? false,
  }
  let installed = 0
  let failed = 0
  for (const [index, source] of sources.entries()) {
    callbacks.onStart?.(source, index)
    try {
      const details = await apiInstallSkills(source, installOpts)
      installed++
      results.push({ source, status: 'ok', details })
    } catch (error) {
      failed++
      results.push({ source, status: 'failed', error: error?.message })
      callbacks.onError?.(source, error)
    }
  }
  return { installed, failed, results }
}
