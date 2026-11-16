import type { Resource } from 'mdast'
import { defineMdastPlugin, type MdastPluginDefinition } from 'satteri'

/**
 * A specification on how to handle a custom protocol. This can either be a string template with
 * `%s` or a function that takes the URL (with the protocol chopped off) and returns a new URL.
 *
 * For example, this transforms `wp:<title>` into Wikipedia links:
 *
 * ```ts
 * "https://en.wikipedia.org/wiki/%s"
 * ```
 *
 * This transforms `rfc:<number>` into RFC links, but also transforms `rfc:std<number>`
 * into standard RFC links, and `rfc:bcp<number>` into best current practice RFC links.
 *
 * ```ts
 * rfc(url) {
 *   if (url.startsWith('std') || url.startsWith('bcp'))
 *     return `https://tools.ietf.org/html/${url}`
 *   else
 *     return `https://tools.ietf.org/html/rfc${url}`
 * }
 * ```
 */
export type ProtocolHandler = `${string}%s${string}` | ((url: string) => string)

/**
 * Options for the plugin.
 */
export interface Options {
  /**
   * Specify custom URL protocols to transform. The key is the protocol name *without* the colon,
   * and the value is its corresponding {@link ProtocolHandler}.
   */
  protocols: Record<string, ProtocolHandler>
}

const rewriteUrl =
  <T extends Resource>({ protocols }: Options) =>
  (node: T): T | undefined => {
    const [protocol] = node.url.split(':')
    const impl = protocols[protocol]
    if (!impl) return
    let subst: string
    if (typeof impl === 'function') {
      subst = impl(node.url.slice(protocol.length + 1))
    } else {
      subst = impl.replace('%s', node.url.slice(protocol.length + 1))
    }
    return { ...node, url: new URL(subst).href }
  }

/**
 * This is the entrypoint of the plugin. For more information, refer to the
 * {@link satteri-custom-protocols | module-level documentation}.
 *
 * @param opts configures this plugin.
 */
export default (opts: Options): MdastPluginDefinition =>
  defineMdastPlugin({
    name: 'custom-protocols',
    link: rewriteUrl(opts),
    definition: rewriteUrl(opts),
  })
