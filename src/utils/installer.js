import { mkdir, cp, writeFile, readFile, access, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { homedir } from 'node:os'
import { getAgentsDir, getClaudeDir, getCursorDir, getWindsurfDir, getCodexDir, getCopilotDir, getAiderDir, getClineDir, getDevinDir, getGeminiDir, getCodyDir, getContinueDir, getWarpDir, getCodeiumDir, getFabricDir, getGooseDir, getTabnineDir, getSupermavenDir, getPrPilotDir, getLoomDir, addSkillToLock, getGlobalLockPath, getProjectLockPath } from './lockfile.js'

function normalizeSlug(slug) {
  return slug.replace(/\//g, '-')
}

export async function installSkill(resolved, targets) {
  const slug = resolved.slug
  const results = []

  for (const target of targets) {
    let baseDir
    let label

    switch (target) {
      case 'agents': {
        baseDir = getAgentsDir()
        label = '~/.agents/skills/'
        break
      }
      case 'claude': {
        baseDir = getClaudeDir()
        label = '~/.claude/skills/'
        break
      }
      case 'cursor': {
        baseDir = getCursorDir()
        label = '~/.cursor/skills/'
        break
      }
      case 'windsurf': {
        baseDir = getWindsurfDir()
        label = '~/.windsurf/skills/'
        break
      }
      case 'codex': {
        baseDir = getCodexDir()
        label = '~/.codex/skills/'
        break
      }
      case 'copilot': {
        baseDir = getCopilotDir()
        label = '~/.copilot/skills/'
        break
      }
      case 'aider': {
        baseDir = getAiderDir()
        label = '~/.aider/skills/'
        break
      }
      case 'cline': {
        baseDir = getClineDir()
        label = '~/.cline/skills/'
        break
      }
      case 'devin': {
        baseDir = getDevinDir()
        label = '~/.devin/skills/'
        break
      }
      case 'gemini': {
        baseDir = getGeminiDir()
        label = '~/.gemini/skills/'
        break
      }
      case 'cody': {
        baseDir = getCodyDir()
        label = '~/.cody/skills/'
        break
      }
      case 'continue': {
        baseDir = getContinueDir()
        label = '~/.continue/skills/'
        break
      }
      case 'warp': {
        baseDir = getWarpDir()
        label = '~/.warp/skills/'
        break
      }
      case 'codeium': {
        baseDir = getCodeiumDir()
        label = '~/.codeium/skills/'
        break
      }
      case 'fabric': {
        baseDir = getFabricDir()
        label = '~/.fabric/skills/'
        break
      }
      case 'goose': {
        baseDir = getGooseDir()
        label = '~/.goose/skills/'
        break
      }
      case 'tabnine': {
        baseDir = getTabnineDir()
        label = '~/.tabnine/skills/'
        break
      }
      case 'supermaven': {
        baseDir = getSupermavenDir()
        label = '~/.supermaven/skills/'
        break
      }
      case 'pr-pilot': {
        baseDir = getPrPilotDir()
        label = '~/.pr-pilot/skills/'
        break
      }
      case 'loom': {
        baseDir = getLoomDir()
        label = '~/.loom/skills/'
        break
      }
      case 'project': {
        baseDir = join(process.cwd(), '.agents', 'skills')
        label = './.agents/skills/'
        break
      }
      default:
        continue
    }

    const slugDir = join(baseDir, normalizeSlug(slug))
    const destSkillPath = join(slugDir, 'SKILL.md')

    await mkdir(slugDir, { recursive: true })

    for (const file of resolved.files) {
      const dst = join(slugDir, file)
      if (resolved.fileContents?.[file]) {
        await writeFile(dst, resolved.fileContents[file])
      } else if (resolved.skillDir) {
        const src = join(resolved.skillDir, file)
        try {
          await stat(src)
          await cp(src, dst, { recursive: true, force: true })
        } catch {
          // skip files that don't exist
        }
      }
    }

    const lockPath = target === 'project'
      ? getProjectLockPath(process.cwd())
      : getGlobalLockPath()

    await addSkillToLock(slug, {
      slug,
      contentSha: resolved.contentSha || 'local',
      installedAt: new Date().toISOString(),
      agents: ['opencode', 'claude-code'],
      source: resolved.sourcePath,
      sourceType: resolved.sourceType,
    }, lockPath)

    results.push({ target, path: slugDir, label })
  }

  return results
}
