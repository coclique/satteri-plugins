import type { Paragraph, PhrasingContent } from 'mdast'
import { u } from 'unist-builder'

export function wrapOne<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x]
}

export function shouldBeEvalString(x: unknown): string {
  return typeof x === 'string' ? x.replaceAll('\\{', '{').replaceAll('\\}', '}') : JSON.stringify(x)
}

export function splitParagraph(
  node: Paragraph,
  test: (line: string) => boolean,
): [PhrasingContent[], string, PhrasingContent[]] | null {
  const before = []
  for (let inlineIx = 0; inlineIx < node.children.length; inlineIx++) {
    const inline = node.children[inlineIx]
    if (inline.type === 'text') {
      const lines = inline.value.split('\n')
      const splitIdx = lines.map(line => line.trim()).findIndex(test)
      if (splitIdx === -1) {
        before.push(inline)
        continue
      }

      if (splitIdx !== 0) before.push(u('text', lines.slice(0, splitIdx).join('\n')))
      const after = [
        ...(splitIdx === lines.length - 1 ? [] : [u('text', lines.slice(splitIdx + 1).join('\n'))]),
        ...node.children.slice(inlineIx + 1),
      ]
      return [before, lines[splitIdx].trim(), after]
    }

    before.push(inline)
  }
  return null
}
