This Sätteri plugin allows for container directives using two colons, instead of three at minimum:

```markdown
::container
... content ...
::
```

This is an **mdast plugin.** Import the {@link default | entrypoint} of this plugin and add it to the `mdastPlugins` of your Sätteri config:

```ts
import twoColons from 'satteri-comark/2colons'
```

If you use this plugin alongside {@link index | comark-mdx}, then this plugin must be ordered earlier.

## Limitations

Note that this plugin doesn't change that each nesting level of container directives must have _distinct_ numbers of colons. This is a limitation of `pulldown-cmark` that we cannot work around. For example, the following input would still parse nonsensically:

```markdown
::container
::container-2
:::container-3
:::container-4
:::
:::
::
::
```

As opposed to this, which parses correctly:

```markdown
::container
:::::container-2
:::container-3
::::container-4
::::
:::
:::::
::
```

Of special note here is that the number of colons need not be strictly increasing or decreasing.
