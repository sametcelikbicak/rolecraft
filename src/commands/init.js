import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function initCommand(name) {
  const skillName = name || 'my-skill'
  const slug = skillName.includes('/') ? skillName : skillName
  const displayName = slug.includes('/') ? slug.split('/')[1] : slug
  const dirName = slug.replace(/\//g, '-')
  const dir = join(process.cwd(), dirName)
  const owner = slug.includes('/') ? slug.split('/')[0] : 'local'

  await mkdir(dir, { recursive: true })

  const content = `---
name: ${displayName}
slug: ${slug}
owner: ${owner}
description: Describe what this skill does
---

Write your skill instructions here.
`

  await writeFile(join(dir, 'SKILL.md'), content)

  console.log(`\n✅ Created skill scaffold at: ${dir}/SKILL.md`)
  console.log(`   Slug: ${slug}`)
  console.log(`   Name: ${displayName}\n`)
  console.log('Next steps:')
  console.log(`  1. Edit ${dir}/SKILL.md with your skill details`)
  console.log(`  2. rolecraft install ${dir}`)
  console.log()
}
