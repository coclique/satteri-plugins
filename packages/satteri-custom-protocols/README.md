> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-custom-protocols) of this package for detailed documentation.

This is a Sätteri plugin can rewrite URLs with custom protocols into regular resolvable ones.

This is an **mdast plugin.**  Import the {@link default | entrypoint} of this plugin and add it to the `mdastPlugins` of your Sätteri config:

```ts
import customProtocols from 'satteri-custom-protocols'
```

Then, configure your custom protocols by passing an {@link Options} object to the plugin.

## Example

This plugin allows you to write terser URLs in Markdown documents. Given this configuration:

```ts
customProtocols({
  protocols: {
    wp: `https://en.wikipedia.org/wiki/%s`,
    rfc: id => {
      if (id.startsWith('std') || id.startsWith('bcp'))
        return `https://tools.ietf.org/html/${id}`
      else return `https://tools.ietf.org/html/rfc${id}`
    },
  },
})
```

It is possible to write

```markdown
[Wikipedia:Artificial Intelligence](wp:Artificial_Intelligence)
[RFC 9110](rfc:9110)
```

instead of the full URLs:

```markdown
[Wikipedia:Artificial Intelligence](https://en.wikipedia.org/wiki/Artificial_Intelligence)
[RFC 9110](https://tools.ietf.org/html/rfc9110)
```
