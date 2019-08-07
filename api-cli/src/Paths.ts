import * as path from 'path';

const cwd = process.cwd()
export const basePath = path.join(cwd, '.api')
export const specStorePath = path.join(basePath, 'spec-store.json')
export const configPath = path.join(basePath, 'api.yml')
export const readmePath = path.join(basePath, 'readme-docs.md')
export const gitignorePath = path.join(basePath, '.gitignore')
export const sessionsPath = path.join(basePath, 'sessions')