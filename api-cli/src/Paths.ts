import * as path from 'path'
import * as findUp from 'find-up'
import * as fs from 'fs-extra'

export interface IPathMapping {

}
export async function getPaths(fallbackPath: (cwd: string) => string = (cwd) => path.join(cwd, '.api')) {
  const rootPath = await (async () => {
    const configPath = await findUp('.api', { type: 'directory' })
    if (configPath) {
      return configPath
    }
    return fallbackPath(process.cwd())
  })()

  await fs.ensureDir(rootPath)
  process.chdir(path.resolve(rootPath, '../'))

  const cwd = process.cwd()
  return getPathsRelativeToCwd(cwd)
}

async function getPathsRelativeToCwd(cwd: string): Promise<IPathMapping> {
  const basePath = path.join(cwd, '.api')
  const specStorePath = path.join(basePath, 'spec-store.json')
  const configPath = path.join(basePath, 'api.yml')
  const readmePath = path.join(basePath, 'readme-docs.md')
  const gitignorePath = path.join(basePath, '.gitignore')
  const sessionsPath = path.join(basePath, 'sessions')
  const exampleRequestsPath = path.join(basePath, 'example-requests')
  await fs.ensureDir(sessionsPath)
  await fs.ensureDir(exampleRequestsPath)
  const outputPath = path.join(basePath, 'generated')

  const integrationsPath = path.join(basePath, 'integrations')
  const integrationContracts = path.join(integrationsPath, 'contracts')
  const integrationExampleRequestsPath = path.join(integrationsPath, 'example-requests')
  await fs.ensureDir(integrationsPath)
  await fs.ensureDir(integrationContracts)
  return {
    cwd,
    basePath,
    specStorePath,
    configPath,
    readmePath,
    gitignorePath,
    sessionsPath,
    exampleRequestsPath,
    outputPath,
    integrationContracts,
    integrationExampleRequestsPath
  }
}
