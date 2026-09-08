import { loadBundleSources, installBundleSources } from './bundle-internal.js'

export async function bundleApi(sources, options = {}) {
  const { sources: skillSources } = await loadBundleSources(sources)
  if (skillSources.length === 0) {
    return { installed: 0, failed: 0, results: [] }
  }
  if (options.dryRun) {
    return { dryRun: true, skills: skillSources }
  }
  return installBundleSources(skillSources, options)
}
