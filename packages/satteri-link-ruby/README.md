> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-link-ruby) of this package for detailed documentation.

This plugin provides a lightweight syntax for ruby annotations piggybacking the Markdown link syntax. A link of the form `[text](=annotation)` will be converted to a ruby annotation. For example, this Markdown

```markdown
[人](=ひと)は[死](=し)して[名](=な)を[残](=のこ)す
```

becomes this HTML (newlines only for presentation purposes):

```html
<ruby>人<rt>ひと</rt></ruby>は
<ruby>死<rt>し</rt></ruby>して
<ruby>名<rt>な</rt></ruby>を
<ruby>残<rt>のこ</rt></ruby>す
```

> <ruby>人<rt>ひと</rt></ruby>は<ruby>死<rt>し</rt></ruby>して<ruby>名<rt>な</rt></ruby>を<ruby>残<rt>のこ</rt></ruby>す

This is subject to the limitations of the Markdown link syntax, namely that you cannot nest links
(or, in this case, ruby annotations). If you need a more powerful syntax, see
`satteri-directive-ruby` or use HTML/MDX syntax directly.

This is an **mdast plugin.** Import the {@link default | entrypoint} of this plugin and add it
to the `mdastPlugins` of your Sätteri config:

```ts
import linkRuby from 'satteri-link-ruby'
```
