> Read the [TypeDoc](https://dayli.ly/satteri-plugins/modules/satteri-typst) of this package for detailed documentation.

This is a Sätteri plugin that renders inline and display math through [Typst](https://typst.app/home).

This is a **hast plugin.** Import the {@link default | entrypoint} of this plugin and add it to the `hastPlugins` of your Sätteri config:

```ts
import typst from 'satteri-typst'
```

It should then automatically detect all inline math and display math that Sätteri outputs.

This plugin has {@link Options} that you can configure.

## Output

Each inline or display math block is transformed into this form:

```html
<span class="typst typst-inline"> <!-- or <div class="typst typst-display"> if display -->
  <code class="sr-only" aria-hidden="true">[... source ...]</code>
  <math class="sr-only" style="user-select: none;">[... rendered MathML ...]</math>
  <svg aria-hidden="true" style="user-select: none;">[... rendered SVG ...]</svg>
</span> <!-- or </div> if display -->
```

This output achieves three purposes:

- The source code is hidden both visually and from the accessibility tree, but it could be selected so that readers can directly copy the Typst source code.
- The MathML is more structured but less visually precise, so it is only visible in the accessibility tree.
- The SVG output is the most visually precise but less structured, so it is only visually visible.

The classes `typst`, `typst-inline` and `typst-display` do no have any style associated with them by default: they are intended for your convenience in case you want to further style the output.

**You should supply an `.sr-only` class** in your CSS that hides elements from the visual display but keeps them available to screen readers. Tailwind already has this class, so you can simply write the following in your global stylesheet to include it:

```css
@source inline('sr-only');
```

Otherwise, this would be a suitable definition:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
```

## Input

Alternatively, you can produce HTML that will be processed by this plugin.

Inline math should be of this form (i.e. what Sätteri outputs for `$...$`):

```html
<code class="language-math math-inline">[... source ...]</code>
```

Display math should be of this form (i.e. what Sätteri outputs for `$$...$$`):

```html
<pre><code class="language-math math-display">[... source ...]</code></pre>
```
