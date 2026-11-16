import {
  NodeCompiler,
  NodeTypstCompileResult,
  NodeTypstDocument,
} from '@myriaddreamin/typst-ts-node-compiler'
import type * as Hast from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { selectAll } from 'hast-util-select'
import { h } from 'hastscript'
import { escape } from 'html-escaper'
import { defineHastPlugin, type HastPluginDefinition } from 'satteri'

function singleton<T>(f: () => T): () => T {
  let store: T | null = null
  return () => {
    if (store === null) {
      store = f()
    }
    return store
  }
}

const typstCompiler = singleton(() => NodeCompiler.create())

interface Params {
  match(node: Hast.Element): string | null
  template(code: string): string
  scale: number
  inline: boolean
  postprocess?: (element: Hast.Element) => void
}

function matchMathCode(codeNode: Hast.Element): string | null {
  if (
    !codeNode ||
    codeNode.type !== 'element' ||
    codeNode.tagName !== 'code' ||
    !codeNode.properties.className?.includes('language-math') ||
    codeNode.children.length !== 1
  )
    return null

  const [text] = codeNode.children
  if (text.type !== 'text') return null

  return text.value
}

const modeSpecs: Record<string, Params> = {
  display: {
    match(node) {
      if (node.tagName !== 'pre' || node.children.length !== 1) return null
      const [code] = node.children
      if (code.type !== 'element' || !code.properties.className?.includes('math-display'))
        return null
      return matchMathCode(code)
    },
    template: code => `$ ${code} $`,
    scale: 1.21,
    inline: false,
  },
  inline: {
    match(node) {
      if (!node.properties.className?.includes('math-inline')) return null
      return matchMathCode(node)
    },
    template: code => `#set page(margin: (y: 0.5em, right: -0.07em))
$baselineanchor ${code}$`,
    scale: 1.1,
    inline: true,
  },
}

function tryGetBaseline(doc: NodeTypstDocument): number | null {
  const compiler = typstCompiler()
  const locator = compiler.query(doc, { selector: '<baselineanchor>' })
  // v8 ignore if
  if (!Array.isArray(locator) || locator.length === 0) return null
  const [meta] = locator
  // v8 ignore if
  if (
    typeof meta !== 'object' ||
    meta == null ||
    !('value' in meta) ||
    typeof meta['value'] !== 'string'
  )
    return null
  const baseline = parseFloat(meta['value'].slice(0, -2))
  // v8 ignore if
  if (isNaN(baseline)) return null
  return baseline
}

function generateMathml(math: string, compileResult: NodeTypstCompileResult): Hast.Element[] {
  // v8 ignore if
  if (compileResult.result == null) {
    compileResult.printDiagnostics()
    return []
  }

  const htmlOutput = typstCompiler().tryHtml(compileResult.result)
  // v8 ignore if
  if (htmlOutput.result == null) {
    htmlOutput.printDiagnostics()
    return []
  }

  const mathNodes = selectAll(
    'math',
    fromHtml(htmlOutput.result.body(), { fragment: true }),
  ) as Hast.Element[]

  for (const mathNode of mathNodes) {
    const child =
      mathNode.children.length === 1 ? mathNode.children[0] : h('mrow', mathNode.children)
    mathNode.children = [
      h('semantics', child, h('annotation', { encoding: 'text/vnd.typst' }, math)),
    ]
    mathNode.properties.className = ['sr-only']
    mathNode.properties.style = 'user-select: none; -webkit-user-select: none;'
  }

  return mathNodes
}

function generateElement(params: Params, math: string): Hast.Element {
  const mainFileContent = `#set page(height: auto, width: auto, margin: 0pt)
#show math.equation: set text(weight: 500)
#let baselineanchor = context [#metadata(here().position().y) <baselineanchor>]
${params.template(math)}`

  const compiler = typstCompiler()
  const compileResult = compiler.compile({ mainFileContent })
  compileResult.printDiagnostics()

  if (compileResult.result == null)
    return h(
      'span',
      { style: 'color: red;' },
      // v8 ignore next
      compileResult
        .takeDiagnostics()
        ?.shortDiagnostics.map(x => x.message)
        .join('; ') || 'Unknown error',
    )

  const svgString = compiler.svg(compileResult.result)
  const svgNode = fromHtml(svgString, { fragment: true }).children[0] as Hast.Element

  const ptInEm = 11 / params.scale
  const heightPt = parseFloat(svgNode.properties['dataHeight'] as string)
  const widthPt = parseFloat(svgNode.properties['dataWidth'] as string)
  svgNode.properties.height = `${heightPt / ptInEm}em`
  svgNode.properties.width = `${widthPt / ptInEm}em`
  svgNode.properties.style = 'display: inline-block; user-select: none; -webkit-user-select: none;'
  svgNode.properties.ariaHidden = 'true'

  if (params.inline) {
    const baselinePt = tryGetBaseline(compileResult.result)
    // v8 ignore if
    if (baselinePt == null) {
      console.warn(
        '[satteri-typst] baselineAdjustment is turned on but baseline could not be determined. Did you forget to include baselineanchor in your template?',
      )
    } else {
      svgNode.properties.style += `vertical-align: -${(heightPt - baselinePt) / ptInEm}em;`
    }
  }

  for (const escapableNode of selectAll('script, style', svgNode)) {
    for (const child of escapableNode.children) {
      // v8 ignore if
      if (child.type !== 'text') continue
      child.value = escape(child.value)
    }
  }

  const htmlCompileResult = compiler.compileHtml({ mainFileContent })
  const mathNodes = generateMathml(math, htmlCompileResult)

  const sourceNode = params.inline
    ? h('code', { className: ['sr-only'], ariaHidden: true }, math)
    : h('pre', { className: ['sr-only'], ariaHidden: true }, h('code', math))

  const wrapper = h(
    'span',
    {
      className: ['typst', params.inline ? 'typst-inline' : 'typst-display'],
      style: [
        'position: relative;',
        params.inline ? 'display: inline-block;' : 'display: block;',
      ].join(' '),
    },
    sourceNode,
    ...mathNodes,
    svgNode,
  )
  params.postprocess?.(wrapper)
  return wrapper
}

function pipeline(params: Params, node: Hast.Element): Hast.Element | null {
  const source = params.match(node)
  if (source == null) return null

  const element = generateElement(params, source)
  return element
}

/**
 * This is the entrypoint of this plugin. Refer to the
 * {@link satteri-typst | module-level documentation} for more information.
 */
export default (): HastPluginDefinition =>
  defineHastPlugin({
    name: 'typst',
    after() {
      typstCompiler().evictCache(30)
    },
    element: {
      filter: ['pre', 'code'],
      async visit(node) {
        for (const params of Object.values(modeSpecs)) {
          const replacement = pipeline(params, node)
          if (replacement) return replacement
        }
      },
    },
  })
