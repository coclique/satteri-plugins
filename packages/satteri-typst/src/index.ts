import type * as Hast from 'hast'
import { defineHastPlugin, type HastPluginDefinition } from 'satteri'
import compiler from './compiler'
import { pipeline, type Params } from './pipeline'

function matchMathCode(el: Hast.ElementContent): el is {
  type: 'element'
  tagName: 'code'
  properties: { className: string[] }
  children: [{ type: 'text'; value: string }]
} {
  return (
    el.type === 'element' &&
    el.tagName === 'code' &&
    !!el.properties.className &&
    el.properties.className.includes('language-math') &&
    el.children.length === 1 &&
    el.children[0].type === 'text'
  )
}

const commonPreamble = (defaultColor: string | undefined) => `#set page(height: auto, width: auto)
#show math.equation: set text(weight: 500)
#let baselineanchor = context [#metadata(here().position().y) <baselineanchor>]
${defaultColor == null ? '' : `#set text(fill: ${defaultColor})`}`

const makeDisplayParams = ({ displayScale = 1.21, defaultColor }: Options): Params => ({
  match(node) {
    if (node.tagName !== 'pre' || node.children.length !== 1) return null
    const [code] = node.children
    if (!matchMathCode(code) || !code.properties.className.includes('math-display')) return null
    return code.children[0].value
  },

  template: code => `${commonPreamble(defaultColor)}
#set page(margin: 0pt)
$ ${code} $`,

  scale: displayScale,
  recolor: defaultColor == null,
  inline: false,
})

const makeInlineParams = ({ inlineScale = 1.1, defaultColor }: Options): Params => ({
  match(node) {
    if (!matchMathCode(node) || !node.properties.className.includes('math-inline')) return null
    return node.children[0].value
  },

  template: code => `${commonPreamble(defaultColor)}
#set page(margin: (y: 0.5em, left: 0pt, right: -0.07em))
$baselineanchor ${code}$`,

  scale: inlineScale,
  recolor: defaultColor == null,
  inline: true,
})

/**
 * Options for this plugin.
 */
export interface Options {
  /**
   * By default, this plugin attempts to set the default output color to
   * [`currentColor`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value#currentcolor_keyword).
   * You can explicitly override a default color by setting this this property to a
   * [Typst color literal](https://typst.app/docs/reference/visualize/color/).
   *
   * @since 0.2.0
   */
  defaultColor?: string

  /**
   * How many em should display math be scaled to.
   *
   * @default 1.21
   * @since 0.2.0
   */
  displayScale?: number

  /**
   * How many em should inline math be scaled to.
   *
   * @default 1.1
   * @since 0.2.0
   */
  inlineScale?: number
}

/**
 * This is the entrypoint of this plugin. Refer to the
 * {@link satteri-typst | module-level documentation} for more information.
 *
 * @param opts configures the plugin.
 */
export default (opts: Options = {}): HastPluginDefinition => {
  const displayParams = makeDisplayParams(opts)
  const inlineParams = makeInlineParams(opts)

  return defineHastPlugin({
    name: 'typst',
    after() {
      compiler().evictCache(30)
    },
    element: {
      filter: ['pre', 'code'],
      async visit(node) {
        const displayReplacement = pipeline(displayParams, node)
        if (displayReplacement) return displayReplacement

        const inlineReplacement = pipeline(inlineParams, node)
        if (inlineReplacement) return inlineReplacement
      },
    },
  })
}
