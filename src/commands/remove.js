import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { readLock, removeSkillFromLock, getAgentsDir, getProjectLockPath } from '../utils/lockfile.js'

function normalizeSlug(slug) {
  return slug.replace(/\//g, '-')
}

function findActualSlug(slug, lock) {
  if (lock.skills[slug]) return slug
  const normalized = normalizeSlug(slug)
  return Object.keys(lock.skills).find(k => normalizeSlug(k) === normalized)
}

export async function removeCommand(slug) {
  const globalLock = await readLock()
  const projectLockPath = getProjectLockPath(process.cwd())
  const projectLock = await readLock(projectLockPath)

  const globalFound = findActualSlug(slug, globalLock)
  const projectFound = findActualSlug(slug, projectLock)

  if (!globalFound && !projectFound) {
    console.error(`Skill "${slug}" not found.`)
    process.exit(1)
  }

  const actualSlug = globalFound || projectFound

  if (globalFound) {
    const dir = join(getAgentsDir(), normalizeSlug(actualSlug))
    try {
      await rm(dir, { recursive: true, force: true })
    } catch {
      // directory might not exist
    }
    await removeSkillFromLock(actualSlug)
  }

  if (projectFound) {
    const projectDir = join(process.cwd(), '.agents', 'skills', normalizeSlug(actualSlug))
    try {
      await rm(projectDir, { recursive: true, force: true })
    } catch {
      // directory might not exist
    }
    await removeSkillFromLock(actualSlug, projectLockPath)
  }

  console.log(`Removed ${actualSlug}.`)
}
