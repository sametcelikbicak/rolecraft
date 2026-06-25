import { accessSync, readdirSync, constants } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { getAgentsDir, getClaudeDir, getCursorDir, getWindsurfDir, getCodexDir, getCopilotDir, getAiderDir, getClineDir } from '../utils/lockfile.js'
import { resolveSource } from '../utils/resolver.js'
import { installSkill } from '../utils/installer.js'

const KNOWN_AGENTS = [
  { flag: 'agents', label: 'opencode', dir: getAgentsDir },
  { flag: 'claude', label: 'claude-code', dir: getClaudeDir },
  { flag: 'cursor', label: 'cursor', dir: getCursorDir },
  { flag: 'windsurf', label: 'windsurf', dir: getWindsurfDir },
  { flag: 'codex', label: 'codex', dir: getCodexDir },
  { flag: 'copilot', label: 'copilot', dir: getCopilotDir },
  { flag: 'aider', label: 'aider', dir: getAiderDir },
  { flag: 'cline', label: 'cline', dir: getClineDir },
]

export function detectAgents() {
  const found = []
  for (const agent of KNOWN_AGENTS) {
    const dir = agent.dir()
    try {
      accessSync(dir, constants.F_OK)
      found.push(agent)
    } catch {
      // agent not installed
    }
  }
  return found
}

function globalAgentsDir() {
  return join(homedir(), '.agents', 'skills')
}

export async function setupCommand(source) {
  const agents = detectAgents()
  const projectDir = join(process.cwd(), '.agents', 'skills')

  console.log('\n🔍 Detecting agents...\n')

  if (agents.length === 0) {
    console.log('   No supported agents detected.\n')
    console.log('   rolecraft installs skills into agent skill directories.')
    console.log('   Install an AI coding agent (opencode, claude-code, cursor,')
    console.log('   windsurf, codex, copilot, aider, cline) first.')
    return
  }

  console.log('   Detected agents:')
  for (const agent of agents) {
    const skillCount = countSkills(agent.dir())
    console.log(`   • ${agent.label.padEnd(15)} ${skillCount} skill(s)`)
  }

  const globalCount = countSkills(globalAgentsDir())
  console.log(`\n   Global (~/.agents/skills/):   ${globalCount} skill(s)`)
  const projectSkillCount = countSkills(projectDir)
  if (projectSkillCount > 0) {
    console.log(`   Project (./.agents/skills/):  ${projectSkillCount} skill(s)`)
  }

  console.log()

  if (source) {
    console.log(`📦 Installing skill from: ${source}`)
    const resolved = await resolveSource(source)

    console.log(`   Found: ${resolved.name} (${resolved.slug})\n`)

    const targets = agents.map(a => a.flag)
    targets.push('project')

    const results = await installSkill(resolved, targets)

    console.log('✅ Installed to all detected agents:\n')
    for (const r of results) {
      console.log(`   ${r.label} → ${r.path}`)
    }
  } else {
    console.log('To install a skill to all detected agents:')
    console.log('  rolecraft setup <source>\n')
    console.log('Examples:')
    console.log('  rolecraft setup ./my-skill')
    console.log('  rolecraft setup sametcelikbicak/task-decomposer')
  }
}

function countSkills(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .length
  } catch {
    return 0
  }
}
