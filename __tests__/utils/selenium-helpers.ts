import path from 'path'
import fs from 'fs'

let version: string | null = null

export function webDriverVersion(): string {
  if (version) {
    return version
  }

  const packagePath = path.join(
    __dirname,
    '../../',
    'node_modules',
    'selenium-webdriver',
    'package.json'
  )

  const data = fs.readFileSync(packagePath, { encoding: 'utf8' })

  version = JSON.parse(data).version
  return version
}
