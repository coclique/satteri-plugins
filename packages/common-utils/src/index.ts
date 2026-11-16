import type { Position } from 'satteri'
import { fileURLToPath } from 'url-extras'

export function here(fileURL: URL | undefined, position: Position | undefined): string {
  const path = fileURL ? fileURLToPath(fileURL) : '(unknown)'
  let pos = position ? `:${position.start.line}:${position.start.column}` : ''
  return path + pos
}

export function onelineify(str: string): string {
  return str.replaceAll(/(\r\n|\r|\n)/g, '↵')
}
