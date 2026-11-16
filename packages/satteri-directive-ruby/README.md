> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-directive-ruby) of this package for detailed documentation.

This Sätteri plugin provides the `:ruby[]` directive for adding ruby annotations to text.

This is an **mdast plugin.** Import the {@link default | entrypoint} of this plugin and add it to the `mdastPlugins` of your Sätteri config:

```ts
import directiveRuby from 'satteri-directive-ruby'
```

If you have plugins that handle *all* directives (such as `satteri-comark`), make sure to place this plugin *before* them for it to take effect.

## Usage

The basic syntax is `:ruby[base(annotation)]`:

```markdown
:ruby[茅場町(かやばちょう)]
```

This renders as the following HTML.

```html
<ruby>茅場町<rt>かやばちょう</rt></ruby>
```

> <ruby>茅場町<rt>かやばちょう</rt></ruby>

However, multiple `base(annotation)` pairs can be used inside one `:ruby[]` directive, and the `/` symbol can be used to delimit text that do not have ruby above them:

```markdown
:ruby[君子(くんし)は/和(わ)して/同(どう)せず]
```

This renders as the following HTML (newlines only for presentation):

```html
<ruby>君子<rt>くんし</rt></ruby>は
<ruby>和<rt>わ</rt></ruby>して
<ruby>同<rt>どう</rt></ruby>せず
```

> <ruby>君子<rt>くんし</rt></ruby>は<ruby>和<rt>わ</rt></ruby>して<ruby>同<rt>どう</rt></ruby>せず

Markdown syntax can also be used *inside* the `:ruby[]` directive, as long as the delimiter characters `()/` are at the top level:

```markdown
:ruby[**人**(ひと)に/**诲**(おし)えて/**倦**(う)まず]
```

This is rendered correctly as (newlines only for presentation):

```html
<ruby><b>人</b><rt>ひと</rt></ruby>に
<ruby><b>诲</b><rt>おし</rt></ruby>えて
<ruby><b>倦</b><rt>う</rt></ruby>まず
```

> <ruby><b>人</b><rt>ひと</rt></ruby>に<ruby><b>诲</b><rt>おし</rt></ruby>えて<ruby><b>倦</b><rt>う</rt></ruby>まず

If you want to enter a literal `/` character, prefix with an ampersand: `&/`, and do the same for parentheses or the ampersand character itself: `&(`, `&)`, `&&`.
