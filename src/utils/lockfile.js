import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

const GLOBAL_AGENTS_DIR = join(homedir(), '.agents')
const GLOBAL_LOCK_PATH = join(GLOBAL_AGENTS_DIR, '.skill-lock.json')
const GLOBAL_AGENTS_SKILLS_DIR = join(GLOBAL_AGENTS_DIR, 'skills')
const CLAUDE_DIR = join(homedir(), '.claude', 'skills')
const CURSOR_DIR = join(homedir(), '.cursor', 'skills')
const WINDSURF_DIR = join(homedir(), '.windsurf', 'skills')
const CODEX_DIR = join(homedir(), '.codex', 'skills')
const COPILOT_DIR = join(homedir(), '.copilot', 'skills')
const AIDER_DIR = join(homedir(), '.aider', 'skills')
const CLINE_DIR = join(homedir(), '.cline', 'skills')
const DEVIN_DIR = join(homedir(), '.devin', 'skills')
const GEMINI_DIR = join(homedir(), '.gemini', 'skills')
const CODY_DIR = join(homedir(), '.cody', 'skills')
const CONTINUE_DIR = join(homedir(), '.continue', 'skills')
const WARP_DIR = join(homedir(), '.warp', 'skills')
const CODEIUM_DIR = join(homedir(), '.codeium', 'skills')
const FABRIC_DIR = join(homedir(), '.fabric', 'skills')
const GOOSE_DIR = join(homedir(), '.goose', 'skills')
const TABNINE_DIR = join(homedir(), '.tabnine', 'skills')
const SUPERMAVEN_DIR = join(homedir(), '.supermaven', 'skills')
const PR_PILOT_DIR = join(homedir(), '.pr-pilot', 'skills')
const LOOM_DIR = join(homedir(), '.loom', 'skills')

export function getGlobalLockPath() {
  return GLOBAL_LOCK_PATH
}

export function getAgentsDir() {
  return GLOBAL_AGENTS_SKILLS_DIR
}

export function getClaudeDir() {
  return CLAUDE_DIR
}

export function getCursorDir() {
  return CURSOR_DIR
}

export function getWindsurfDir() {
  return WINDSURF_DIR
}

export function getCodexDir() {
  return CODEX_DIR
}

export function getCopilotDir() {
  return COPILOT_DIR
}

export function getAiderDir() {
  return AIDER_DIR
}

export function getClineDir() {
  return CLINE_DIR
}

export function getDevinDir() {
  return DEVIN_DIR
}

export function getGeminiDir() {
  return GEMINI_DIR
}

export function getCodyDir() {
  return CODY_DIR
}

export function getContinueDir() {
  return CONTINUE_DIR
}

export function getWarpDir() {
  return WARP_DIR
}

export function getCodeiumDir() {
  return CODEIUM_DIR
}

export function getFabricDir() {
  return FABRIC_DIR
}

export function getGooseDir() {
  return GOOSE_DIR
}

export function getTabnineDir() {
  return TABNINE_DIR
}

export function getSupermavenDir() {
  return SUPERMAVEN_DIR
}

export function getPrPilotDir() {
  return PR_PILOT_DIR
}

export function getLoomDir() {
  return LOOM_DIR
}

export function getProjectLockPath(cwd) {
  return join(cwd, '.agents', '.skill-lock.json')
}

async function ensureParentDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true })
}

export async function readLock(lockPath = GLOBAL_LOCK_PATH) {
  try {
    await access(lockPath)
    const raw = await readFile(lockPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { version: 3, skills: {}, dismissed: {}, lastSelectedAgents: [] }
  }
}

export async function writeLock(data, lockPath = GLOBAL_LOCK_PATH) {
  await ensureParentDir(lockPath)
  await writeFile(lockPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

export async function addSkillToLock(slug, entry, lockPath = GLOBAL_LOCK_PATH) {
  const lock = await readLock(lockPath)
  lock.skills[slug] = { ...entry, installedAt: new Date().toISOString() }
  await writeLock(lock, lockPath)
  return lock
}

export async function removeSkillFromLock(slug, lockPath = GLOBAL_LOCK_PATH) {
  const lock = await readLock(lockPath)
  delete lock.skills[slug]
  await writeLock(lock, lockPath)
  return lock
}
