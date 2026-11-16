import { CharStream, CommonTokenStream } from 'antlr4ng'
import type { PhrasingContent } from 'mdast'
import { nanoid } from 'nanoid/non-secure'
import { defineMdastPlugin, type MdastPluginDefinition } from 'satteri'
import { u } from 'unist-builder'
import { fileURLToPath } from 'url-extras'
import { RubyDirectiveBodyLexer } from '../syntax/RubyDirectiveBodyLexer'
import { RubyDirectiveBodyParser } from '../syntax/RubyDirectiveBodyParser'
import * as Parser from '../syntax/RubyDirectiveBodyParser'

type RubyRepr = (string | { rb: string; rt: string })[]

class RubyAst {
  static root(ctx: Parser.RootContext) {
    return ctx
      .segment()
      .map(RubyAst.segment)
      .filter(x => x != null)
  }

  static segment(ctx: Parser.SegmentContext) {
    const [annot, plain] = [ctx.annot(), ctx.plain()]
    if (annot) return RubyAst.annot(annot)
    else if (plain) return RubyAst.plain(plain)
    else /* divider */ return null
  }

  static annot(ctx: Parser.AnnotContext) {
    const [base, annotation] = ctx.stretch()
    return { rb: RubyAst.stretch(base), rt: RubyAst.stretch(annotation) }
  }

  static plain(ctx: Parser.PlainContext) {
    return RubyAst.stretch(ctx.stretch())
  }

  static stretch(nodes: Parser.StretchContext) {
    return nodes
      .CHAR()
      .map(node => node.getText().slice(-1))
      .join('')
  }
}

/**
 * The entrypoint of this plugin. Refer to the
 * {@link satteri-directive-ruby | module-level documentation} for more information.
 */
export default (): MdastPluginDefinition =>
  defineMdastPlugin({
    name: 'directive-ruby',
    textDirective(node, ctx) {
      if (node.name !== 'ruby') return

      const childIds = new Map<string, PhrasingContent>()

      const splitToken = `+${nanoid(7)}+`
      const nontextToken = `<node:${nanoid(7)}:`
      const wrapNontextId = (id: string) => `${nontextToken}${id}>`
      const unwrapNontextId = (id: string) => id.slice(nontextToken.length, -1)

      const stringifiedChildren = node.children
        .map(child => {
          if (child.type === 'text') return child.value
          const id = nanoid(7)
          childIds.set(id, child)
          return wrapNontextId(id)
        })
        .join(splitToken)

      const recoverChildren = (text: string): PhrasingContent[] =>
        text
          .split(splitToken)
          .map(item =>
            item.startsWith(nontextToken) ? childIds.get(unwrapNontextId(item))! : u('text', item),
          )

      let ast: RubyRepr
      try {
        const lexer = new RubyDirectiveBodyLexer(CharStream.fromString(stringifiedChildren))
        const parser = new RubyDirectiveBodyParser(new CommonTokenStream(lexer))
        ast = RubyAst.root(parser.root())
      } catch (e) /* v8 ignore next */ {
        console.error(
          `${fileURLToPath(ctx.fileURL ?? new URL('file:///unknown'))}:`,
          '[satteri-directive-ruby] Failed to parse ruby directive content:',
          e,
        )
        return
      }

      const newNodes: PhrasingContent[] = ast
        .map(item => {
          if (typeof item === 'string') return recoverChildren(item)
          return [
            u('textDirective', { name: 'ruby', data: { hName: 'ruby' } }, [
              ...recoverChildren(item.rb),
              u('textDirective', { name: 'rp', data: { hName: 'rp' } }, [u('text', '(')]),
              u('textDirective', { name: 'rt', data: { hName: 'rt' } }, recoverChildren(item.rt)),
              u('textDirective', { name: 'rp', data: { hName: 'rp' } }, [u('text', ')')]),
            ]),
          ]
        })
        .flat()

      ctx.replaceNode(node, newNodes)
    },
  })
