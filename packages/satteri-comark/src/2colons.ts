/**
 * {@include 2colons.md}
 * @module
 */
import type { BlockContent, DefinitionContent, Parent, RootContent } from 'mdast'
import {
  defineMdastPlugin,
  type MdastNode,
  type MdastPluginDefinition,
  type MdastVisitorContext,
} from 'satteri'
import { u } from 'unist-builder'
import { omit, splitParagraph, type ContainerDirective, type LeafDirective } from './util'

/**  */
export interface Options {
  /**
   * Behavior when encoutering an unterminated 2-colon directive.
   *
   * - `'error'`: Throw an error.
   * - `'greedy'`: Assume the directive extends as far as possible, until the next 2-colon
   *   directive or the end of its parent element.
   * - `'self-closing'`: Treat the directive as self-closing; no content is contained inside. Note
   *    that this recovers the classical behavior of "leaf directives".
   * @default 'self-closing'
   */
  onUnterminated?: 'error' | 'greedy' | 'self-closing'
}

const visit =
  ({ onUnterminated = 'self-closing' }: Options) =>
  <U extends MdastNode & Parent>(node: U, ctx: MdastVisitorContext): void => {
    const newChildren: RootContent[] = []

    let start: LeafDirective | null = null
    let inside: RootContent[] = []

    let commit = (terminated: boolean) => {
      if (start) {
        if (!terminated && onUnterminated === 'error') {
          throw new Error(`Unterminated directive: ${start.name}`)
        } else if (!terminated && onUnterminated === 'self-closing') {
          newChildren.push(start)
        } else /* terminated || onUnterminated === 'greedy' */ {
          newChildren.push(
            u('containerDirective', omit(start, 'type'), [
              ...(start.children.length
                ? [u('paragraph', { data: { directiveLabel: true } }, start.children)]
                : []),
              ...(inside as (BlockContent | DefinitionContent)[]),
            ]) satisfies ContainerDirective,
          )
          inside = []
        }
      }
      newChildren.push(...inside)
    }

    for (let blockIx = 0; blockIx < node.children.length; blockIx++) {
      const block = node.children[blockIx]

      if (block.type === 'leafDirective') {
        commit(false)
        start = block
        inside = []
      } else if (start && block.type === 'paragraph') {
        const split = splitParagraph(block, line => line === '::')
        if (!split) {
          inside.push(block)
          continue
        }

        const [before, _, after] = split
        inside.push(...(before.length ? [u('paragraph', before)] : []))
        commit(true)
        start = null
        inside = after.length ? [u('paragraph', after)] : []
      } else {
        inside.push(block)
      }
    }
    commit(false)

    ctx.replaceNode(node, { ...node, children: newChildren } as U)
  }

/**
 * This is the entrypoint of the plugin. For more information, refer to the
 * {@link 2colons | module-level documentation}.
 *
 * @param opts configures this plugin.
 */
export default (opts: Options = {}): MdastPluginDefinition =>
  defineMdastPlugin({
    name: 'directive-2-colons',
    before: visit(opts),
    blockquote: visit(opts),
    listItem: visit(opts),
    footnoteDefinition: visit(opts),
    containerDirective: visit(opts),
    descriptionDetails: visit(opts),
    mdxJsxFlowElement: visit(opts),
  })
