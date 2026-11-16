> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-extended-table) of this package for detailed documentation.

This Sätteri plugin allows you to write Markdown tables with colspans and rowspans. A cell containing only `^` is merged with the cell above, and a cell containing only `>` is merged with the cell to the right.

This is an **mdast plugin.** Import the {@link default | entrypoint} of this plugin and add it to the `mdastPlugins` of your Sätteri config:

```ts
import extendedTable from 'satteri-extended-table'
```

## Example

```markdown
| header1          | header2          |
| ---------------- | ---------------- |
| cell (rowspan=2) | cell             |
| ^                | cell             |
| >                | cell (colspan=2) |
| escape >         | :raw[>]          |
| escape ^         | :raw[^]          |
```

In this example, the two cells marked with `(rowspan=2)` and `(colspan=2)` are merged, respectively, with the cell below and the cell to the left.

## Cautions

- This plugin outputs directives, so it requires the directives feature in Sätteri to be enabled.
- If you want to write a literal `>` or `^`, you need to wrap it in a `:raw` directive: `:raw[>]`. Unfortunately, escaping with a backslash won't work due to Sätteri's limitations.
- This plugin destroys the table structure in the mdast. If you have other plugins that transform tables non-destructively, place this plugin after them.
