import * as path from 'path'
import * as findUp from 'find-up'
import * as fs from 'fs-extra'

export interface IPathMapping {
  cwd: string
  basePath: string
  specStorePath: string
  configPath: string
  gitignorePath: string
  captures: string
  exampleRequestsPath: string
  outputPath: string
}

export async function getPaths(fallbackPath: (cwd: string) => string = (cwd) => path.join(cwd, '.optic')) {
  const rootPath = await (async () => {
    const configPath = await findUp('.optic.yml', {type: 'file'})
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
  const basePath = path.join(cwd, '.optic')
  const configPath = path.join(cwd, 'optic.yml')
  const specStorePath = path.join(basePath, 'specification.json')
  const gitignorePath = path.join(basePath, '.gitignore')
  const captures = path.join(basePath, 'captures')
  const exampleRequestsPath = path.join(basePath, 'example-requests')
  await fs.ensureDir(captures)
  await fs.ensureDir(exampleRequestsPath)
  const outputPath = path.join(basePath, 'generated')

  return {
    cwd,
    basePath,
    specStorePath,
    configPath,
    gitignorePath,
    captures,
    exampleRequestsPath,
    outputPath,
  }
}
