import * as path from 'path'
import * as findUp from 'find-up'
import * as fs from 'fs-extra'

export async function getPaths() {
  const rootPath = await (async () => {
    const configPath = await findUp('.api', {type: "directory"})
    if (configPath) {
      return configPath
    }
    return path.join(process.cwd(), '.api')
  })()
  await fs.ensureDir(rootPath)
  process.chdir(path.resolve(rootPath, '../'))

  const cwd = process.cwd()
  const basePath = path.join(cwd, '.api')
  const specStorePath = path.join(basePath, 'spec-store.json')
  const configPath = path.join(basePath, 'api.yml')
  const readmePath = path.join(basePath, 'readme-docs.md')
  const gitignorePath = path.join(basePath, '.gitignore')
  const sessionsPath = path.join(basePath, 'sessions')
  const outputPath = path.join(basePath, 'output')

  return {
    cwd,
    basePath,
    specStorePath,
    configPath,
    readmePath,
    gitignorePath,
    sessionsPath,
    outputPath
  }
}
