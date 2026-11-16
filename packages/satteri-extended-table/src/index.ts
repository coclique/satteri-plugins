import { here, onelineify } from 'common-utils'
import type { BlockContent, DefinitionContent, PhrasingContent, TableCell } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { defineMdastPlugin, type ContainerDirective, type MdastPluginDefinition } from 'satteri'
import { u } from 'unist-builder'

function isMergeH(cell: TableCell): boolean {
  if (cell.children.length !== 1) return false
  let child = cell.children[0]
  if (child.type !== 'text') return false
  return child.value.trim() === '>'
}

function isMergeV(cell: TableCell): boolean {
  if (cell.children.length !== 1) return false
  let child = cell.children[0]
  if (child.type !== 'text') return false
  return child.value.trim() === '^'
}

function hasContent(cell: TableCell): boolean {
  if (cell.children.length === 0) return false
  if (cell.children.length > 1) return true
  let child = cell.children[0]
  if (child.type !== 'text') return true
  let text = child.value.trim()
  if (text === '' || text === '>' || text === '^') return false
  return true
}

function unwrapRaw(children: PhrasingContent[]): PhrasingContent[] {
  return children.flatMap(child => {
    if (child.type === 'textDirective' && child.name === 'raw') return child.children
    else return [child]
  })
}

/**
 * The entrypoint of this plugin. For more information, refer to the
 * {@link satteri-extended-table | module-level documentation}.
 */
export default (): MdastPluginDefinition =>
  defineMdastPlugin({
    name: 'extended-table',
    options: { position: true },
    table(node, ctx) {
      const skips: boolean[][] = node.children.map(row => row.children.map(() => false))

      const newRows = node.children.map((row, nrow) => {
        const newChildren: ContainerDirective[] = []

        for (let ncol = row.children.length - 1; ncol >= 0; ncol--) {
          const cell = row.children[ncol]
          if (skips[nrow][ncol]) {
            if (hasContent(cell))
              console.warn(
                `${here(ctx.fileURL, cell.position)}:`,
                `[satteri-extended-table] Cell has content but is skipped:`,
                onelineify(toMarkdown({ ...cell, type: 'paragraph' }).trim()),
              )
            continue
          }

          let rowspan = 1
          let colspan = 1
          for (let nrow2 = nrow + 1; nrow2 < node.children.length; nrow2++) {
            if (!isMergeV(node.children[nrow2].children[ncol])) break
            rowspan++
          }
          for (let ncol2 = ncol - 1; ncol2 >= 0; ncol2--) {
            if (!isMergeH(row.children[ncol2])) break
            colspan++
          }

          let attributes: Record<string, string> = {}
          if (rowspan > 1) attributes['rowspan'] = String(rowspan)
          if (colspan > 1) attributes['colspan'] = String(colspan)
          let align = node.align?.[ncol]
          if (align) attributes['style'] = `text-align: ${align};`

          let name = nrow === 0 ? 'th' : 'td'
          newChildren.push(
            u(
              'containerDirective',
              { name, attributes, data: { hName: name, hProperties: attributes } },
              unwrapRaw(cell.children) as (BlockContent | DefinitionContent)[],
            ),
          )
          for (let nrow2 = nrow; nrow2 < nrow + rowspan; nrow2++) {
            for (let ncol2 = ncol; ncol2 > ncol - colspan; ncol2--) {
              skips[nrow2][ncol2] = true
            }
          }
        }
        return u(
          'containerDirective',
          { name: 'tr', data: { hName: 'tr' } },
          newChildren.reverse(),
        ) satisfies ContainerDirective
      })
      return u('containerDirective', { name: 'table', data: { hName: 'table' } }, [
        u('containerDirective', { name: 'thead', data: { hName: 'thead' } }, [newRows[0]]),
        u('containerDirective', { name: 'tbody', data: { hName: 'tbody' } }, newRows.slice(1)),
      ]) satisfies ContainerDirective
    },
  })
