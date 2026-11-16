> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-custom-protocols) of this package for detailed documentation.

This is a Sätteri plugin can rewrite URLs with custom protocols into regular resolvable ones.

This is an **mdast plugin.**  Import the {@link default | entrypoint} of this plugin and add it
to the `mdastPlugins` of your Sätteri config:

```ts
import customProtocols from 'satteri-custom-protocols'
```

## Example

This plugin allows you to write terser URLs in Markdown documents, such as

```markdown
[Wikipedia:Artificial Intelligence](wp:Artificial_Intelligence)
[RFC 9110](rfc:9110)
```

instead of

```markdown
[Wikipedia:Artificial Intelligence](https://en.wikipedia.org/wiki/Artificial_Intelligence)
[RFC 9110](https://tools.ietf.org/html/rfc9110)
```
