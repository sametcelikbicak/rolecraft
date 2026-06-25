# Competitive Analysis & Roadmap

## rolecraft vs Competitors

| Feature | rolecraft | @agentskill.sh/cli | skills (Vercel) | OpenCode native | Claude Code |
|---------|-----------|-------------------|-----------------|-----------------|-------------|
| **Runtime deps** | **0** | 2 | 1 (`yaml`) | 0 (built-in) | 0 (built-in) |
| **Package size** | ~3 KB | 84 KB | 465 KB | N/A | N/A |
| **Source types** | Local + GitHub | Registry only | GitHub/GitLab/git URL/Local/npm | Filesystem only | Filesystem + MCP + plugins |
| **Lockfile** | agentskill v3 | None | Two-tier (global v3 + project v1, SHA hashes) | None | Config files only |
| **Offline capable** | ✅ | ❌ (registry) | ✅ | ✅ | ✅ |
| **Signup required** | ❌ | ✅ (agentskill.sh) | ❌ | ❌ | ❌ |
| **Agent count** | 4 | 20+ | 68+ | 3 | ~10 |
| **Interaktif scope** | ✅ | ❌ | ❌ (project default) | N/A | N/A |
| **Provenance (npm)** | ✅ (v0.1.5) | ❌ | ❌ | N/A | N/A |
| **Stars** | ~5 | 23 | 23,476 | 14K+ | N/A |

## Strengths

- **Zero dependencies** — only Node.js built-in modules
- **Minimal size** — ~3 KB, 6 source files
- **Provenance publishing** — SLSA Level 1+ via npm provenance
- **GitHub + Local sources** — fully decentralized
- **agentskill.sh lockfile compatible** — cross-compatible with ecosystem
- **Interactive scope prompt** — user-friendly first install

## Weaknesses / Gaps

1. **Agent target count (4)** — far behind `skills` (68+) and `ags` (20+)
2. **No `use` command** — cannot print skill content without installing
3. **No `setup` command** — no auto-detection of installed agents
4. **No `search` command** — no built-in skill discovery
5. **No lockfile integrity** — no SHA hash verification, no `ci` mode
6. **No `init` command** — no SKILL.md scaffolding
7. **Project scope not default** — interactive prompt every time

## Roadmap

### v0.2.x — Feature parity with competitors

- [x] More agent targets (`--windsurf`, `--codex`, `--copilot`, `--aider`, `--cline`)
- [x] `rolecraft use <source>` — temporary skill output
- [x] `rolecraft setup` — auto-detect agents
- [x] Project scope as default install target

### v0.3.x — Advanced features

- [ ] `rolecraft search <query>` — skill discovery via GitHub API
- [ ] `rolecraft init [name]` — SKILL.md scaffolding
- [ ] Lockfile SHA hash verification + `rolecraft verify`
- [ ] `rolecraft ci` — frozen lockfile install

### Future

- [ ] Plugin system (install bundles of skills)
- [ ] TUI for skill browsing
- [ ] Docker-based sandboxed installs

## Agent Directory Reference

| Agent | Directory |
|-------|-----------|
| opencode | `~/.agents/skills/` or `./.agents/skills/` |
| claude-code | `~/.claude/skills/` or `./.claude/skills/` |
| cursor | `~/.cursor/skills/` or `./.cursor/skills/` |
| windsurf | `~/.windsurf/skills/` or `./.windsurf/skills/` |
| codex | `~/.codex/skills/` or `./.codex/skills/` |
| copilot | `~/.copilot/skills/` or `./.copilot/skills/` |
| aider | `~/.aider/skills/` or `./.aider/skills/` |
| cline | `~/.cline/skills/` or `./.cline/skills/` |

## Competitor Analysis

### @agentskill.sh/cli (ags)
- **Model**: Centralized registry
- **Key feature**: 274K+ skills in marketplace, rating/feedback system, `/learn` in-agent command
- **Weakness**: Requires signup, no lockfile, no offline, no local sources
- **Deps**: 2

### skills (Vercel Labs)
- **Model**: Decentralized git-based
- **Key feature**: `skills use` (temporary), `skills ci`/`skills verify` (lockfile workflow), 68+ agents, 23K stars
- **Weakness**: 1 dep (`yaml`), no provenance
- **Deps**: 1

### OpenCode native
- **Model**: Passive filesystem discovery
- **Key feature**: Granular per-agent permissions, native `skill` tool, no CLI needed
- **Weakness**: No external source management, no lockfile

### Claude Code
- **Model**: Skills + MCP servers + Plugin marketplace
- **Key feature**: OAuth 2.1, dual skill/MCP system, lazy tool loading, `/run-skill-generator`
- **Weakness**: Complex, MCP-focused, not a standalone skill manager
