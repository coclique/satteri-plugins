import { NodeTypstCompileResult, NodeTypstDocument } from '@myriaddreamin/typst-ts-node-compiler'
import type * as Hast from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { selectAll } from 'hast-util-select'
import { h } from 'hastscript'
import { remove } from 'unist-util-remove'
import compiler from './compiler'

export interface Params {
  match(node: Hast.Element): string | null
  template(code: string): string
  scale: number
  inline: boolean
  recolor: boolean
}

function tryGetBaseline(doc: NodeTypstDocument): number | null {
  const locator = compiler().query(doc, { selector: '<baselineanchor>' })
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

  const htmlOutput = compiler().tryHtml(compileResult.result)
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
  const tagName = params.inline ? 'span' : 'div'
  const mainFileContent = params.template(math)

  const compileResult = compiler().compile({ mainFileContent })
  compileResult.printDiagnostics()

  if (compileResult.result == null)
    return h(
      tagName,
      { className: ['typst-error'] },
      // v8 ignore next
      compileResult
        .takeDiagnostics()
        ?.shortDiagnostics.map(x => x.message)
        .join('; ') || 'Unknown error',
    )

  const svgString = compiler().svg(compileResult.result)
  const svgNode = fromHtml(svgString, { fragment: true }).children[0] as Hast.Element
  remove(svgNode, [{ tagName: 'foreignObject' }, { tagName: 'style' }, { tagName: 'script' }])

  if (params.recolor) {
    const toRefill = selectAll('[fill="#000"]', svgNode, 'svg')
    const toRestroke = selectAll('[stroke="#000"]', svgNode, 'svg')
    for (const node of toRefill) node.properties.fill = 'currentColor'
    for (const node of toRestroke) node.properties.stroke = 'currentColor'
  }

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

  const htmlCompileResult = compiler().compileHtml({ mainFileContent })
  const mathNodes = generateMathml(math, htmlCompileResult)

  const sourceNode = params.inline
    ? h('code', { className: ['sr-only'], ariaHidden: true }, math)
    : h('pre', { className: ['sr-only'], ariaHidden: true }, h('code', math))

  const wrapper = h(
    tagName,
    { className: ['typst', params.inline ? 'typst-inline' : 'typst-display'] },
    sourceNode,
    ...mathNodes,
    svgNode,
  )
  return wrapper
}

export function pipeline(params: Params, node: Hast.Element): Hast.Element | null {
  const source = params.match(node)
  if (source == null) return null

  const element = generateElement(params, source)
  return element
}
