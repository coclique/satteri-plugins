import { defineMdastPlugin, type MdastPluginDefinition } from 'satteri'
import { u } from 'unist-builder'

/**
 * This is the entrypoint of this plugin. Refer to the
 * {@link satteri-link-ruby | module-level documentation} for more information.
 */
export default (): MdastPluginDefinition =>
  defineMdastPlugin({
    name: 'link-ruby',
    link(node) {
      if (!node.url.startsWith('=')) return

      return u('textDirective', { name: 'ruby', data: { hName: 'ruby' } }, [
        ...node.children,
        u('textDirective', { name: 'rp', data: { hName: 'rp' } }, [u('text', '(')]),
        u('textDirective', { name: 'rt', data: { hName: 'rt' } }, [u('text', node.url.slice(1))]),
        u('textDirective', { name: 'rp', data: { hName: 'rp' } }, [u('text', ')')]),
      ])
    },
  })
