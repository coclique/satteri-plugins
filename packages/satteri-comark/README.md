> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-comark) of this package for detailed documentation.

This is a Sätteri plugin that adds support for most of [Comark](https://comark.dev)'s component syntax by transforming it into MDX. It also works if you just want to transform Markdown directives into MDX.

There are two **mdast plugins** in this package:

```ts
import directiveTwoColons from 'satteri-comark/2colons'
import comarkMdx from 'satteri-comark'
```

- {@link 2colons | **`directiveTwoColons`**} parses two-colon directives (`::component`) into container directives.

- {@link index | **`comarkMdx`**} provides all other functionalities, which you can configure through a variety of {@link index.Options | Options}.

  It is possible to use this plugin without `directiveTwoColons`, it just means that two-colon directives will be parsed as leaf directives (Sätteri's deafult behavior).

To use, add them to the `mdastPlugins` of your Sätteri config. `directiveTwoColons` must be ordered before `comarkMdx`.

## Example

Take this scary example from Comark docs:

````markdown
::card{.featured}
```yaml [props]
variant: elevated
color: primary
actions:
  - label: Read More
    url: /article
  - label: Share
    icon: share
```
#header
## Article Title
*By Jane Doe*

#content
This is the main article content with **markdown** support.

#footer
Published on January 15, 2024
::
````

With this plugin, Sätteri can transform it into the following JSX output:

```jsx
<Card
  class="featured"
  variant="elevated"
  color="primary"
  actions={[
    {
      label: "Read More",
      url: "/article",
    },
    {
      label: "Share",
      icon: "share",
    },
  ]}
>
  <Fragment slot="header">
    <h2>{"Article Title"}</h2>
    <p>
      <em>{"By Jane Doe"}</em>
    </p>
  </Fragment>
  <Fragment slot="content">
    {"This is the main article content with "}
    <strong>{"markdown"}</strong>
    {" support."}
  </Fragment>
  <Fragment slot="footer">{"Published on January 15, 2024"}</Fragment>
</Card>
```

## Supported Comark features

- Translation of block components and inline components into MDX
- Data binding syntax (`:prop="expr"`)
- Block props inside code fences
- Named slots. You can customize what slots transform into, and this package includes an adapter for [Astro](https://astro.build).
- Optional support for two-colon component syntax (`::component` can be a container) in the {@link 2colons} module.

## Extra features not found in Comark

- In addition to normal data bindings for props, you can specify an expression to spread by setting the prop with name `::` (more convenient for inline props) or `...` (more convenient for block props) to that expression. For example, `:component{::="{prop: 'value'}"}`.

- Block props support more languages by default, powered by [`confbox`](https://npmjs.com/package/confbox). Currently, in addition to YAML, JSON5, JSON with comments (JSONC), JSON, TOML, and INI are supported; just specify the language of the code block. You can also customize the behavior of prop blocks.

- You can embed MDX `import/export` statements with ` ```jsx|tsx [script] ` code blocks.

- You can embed JSX expressions with ` ```jsx|tsx [embed] ` code blocks.

## Divergences from Comark

In data bindings, values are just plain JS expressions (for example, you can do `:prop="arbitraryFunction()"`). This is more flexible than Comark.

On the other hand, the data binding namespaces that Comark provides (`frontmatter`, `meta`, `data`, `props`) aren't set up by this plugin, and you or your framework need to inject them into your MDX environment. For example, Astro provides the `frontmatter` variable to all MDX files.

## Unsupported features

- Frontmatter-style block props are not supported because Sätteri cannot parse them.

- Nesting components must each have a distinct number of colons, otherwise Sätteri cannot parse them (bruits/satteri#203).

- Other Comark extensions, such as admonitions (there are separate Sätteri plugins you can use) or block attributes (planned: bruits/satteri#139).
