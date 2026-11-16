import { mdRenderer, mdxRenderer, type Options } from 'test-utils'
import { expect, test } from 'vitest'
import typst from '.'

const opts: Options = {
  hastPlugins: [typst()],
  features: { math: true, rawHtml: true },
  then: html => html.replaceAll(/<svg.+?<\/svg\s*>/gs, '<svg><!-- snip --></svg>'),
}
const render = mdRenderer(opts)
const renderx = mdxRenderer(opts)

test('will render inline math', async () => {
  const source = `That right triangles satisfy $x^2 + y^2 = z^2$ has been known since antiquity.`
  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      That right triangles satisfy
      <span class="typst typst-inline" style="position: relative; display: inline-block"
        ><code class="sr-only" aria-hidden>x^2 + y^2 = z^2</code
        ><math class="sr-only" style="user-select: none; -webkit-user-select: none"
          ><semantics
            ><mrow
              ><msup><mi>𝑥</mi><mn>2</mn></msup
              ><mo>+</mo><msup><mi>𝑦</mi><mn>2</mn></msup
              ><mo>=</mo><msup><mi>𝑧</mi><mn>2</mn></msup></mrow
            ><annotation encoding="text/vnd.typst">x^2 + y^2 = z^2</annotation></semantics
          ></math
        ><svg><!-- snip --></svg></span>
      has been known since antiquity.
    </p>
    "
  `)
})

test('will render display math', async () => {
  const source = `
    The non-dependently-typed *recursor* of the natural number type is

    $$
    "rec"_NN : product_(A : cal(U)) A -> (A -> A) -> NN -> A.
    $$
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>The non-dependently-typed <em>recursor</em> of the natural number type is</p>
    <span class="typst typst-display" style="position: relative; display: block">
      <pre
        class="sr-only"
        aria-hidden
      ><code>"rec"_NN : product_(A : cal(U)) A -&gt; (A -&gt; A) -&gt; NN -&gt; A.</code></pre>
      <math display="block" class="sr-only" style="user-select: none; -webkit-user-select: none"
        ><semantics
          ><mrow>
            <msub>
              <mtext>rec</mtext>
              <mi>ℕ</mi>
            </msub>
            <mo lspace="0.2777777777777778em" rspace="0.2777777777777778em">:</mo>
            <munder>
              <mo form="prefix" lspace="0em">∏</mo>
              <mrow>
                <mi>𝐴</mi>
                <mo rspace="0em">:</mo>
                <mi>𝒰︀</mi>
              </mrow>
            </munder>
            <mi>𝐴</mi>
            <mo stretchy="false">→</mo>
            <mrow>
              <mo>(</mo>
              <mrow>
                <mi>𝐴</mi>
                <mo stretchy="false">→</mo>
                <mi>𝐴</mi>
              </mrow>
              <mo>)</mo>
            </mrow>
            <mo stretchy="false">→</mo>
            <mi>ℕ</mi>
            <mo stretchy="false">→</mo>
            <mi>𝐴</mi>
            <mi>.</mi> </mrow
          ><annotation encoding="text/vnd.typst"
            >"rec"_NN : product_(A : cal(U)) A -&gt; (A -&gt; A) -&gt; NN -&gt; A.</annotation
          ></semantics
        ></math
      ><svg><!-- snip --></svg></span>
    "
  `)
})

test('renders error message when the math is invalid', async () => {
  const source = `It would be incorrect to refer to multi-letter names without quotation: $ab$`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      It would be incorrect to refer to multi-letter names without quotation:
      <span style="color: red"
        >unknown variable: ab, hints: if you meant to display multiple letters as is, try adding spaces
        between each letter: \`a b\`, or if you meant to display this as text, try placing it in quotes:
        \`"ab"\`</span
      >
    </p>
    "
  `)
})

test('will render manually inserted HTML math blocks', async () => {
  const source = `
    <pre><code class="language-math math-display">lim_(i -> 0) (sin x) / x = 1</code></pre>

    <code class="language-math math-inline">lim_(x -> oo) sum_(i = 0)^x 1/x in.not RR</code>
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<span class="typst typst-display" style="position: relative; display: block">
      <pre class="sr-only" aria-hidden><code>lim_(i -&gt; 0) (sin x) / x = 1</code></pre>
      <math display="block" class="sr-only" style="user-select: none; -webkit-user-select: none"
        ><semantics
          ><mrow>
            <munder>
              <mo lspace="0em" rspace="0.16666666666666666em">lim</mo>
              <mrow>
                <mi>𝑖</mi>
                <mo lspace="0em" rspace="0em" stretchy="false">→</mo>
                <mn>0</mn>
              </mrow>
            </munder>
            <mfrac>
              <mrow>
                <mo lspace="0em" rspace="0.16666666666666666em">sin</mo>
                <mi>𝑥</mi>
              </mrow>
              <mi>𝑥</mi>
            </mfrac>
            <mo>=</mo>
            <mn>1</mn> </mrow
          ><annotation encoding="text/vnd.typst">lim_(i -&gt; 0) (sin x) / x = 1</annotation></semantics
        ></math
      ><svg><!-- snip --></svg></span>
    <p>
      <span class="typst typst-inline" style="position: relative; display: inline-block"
        ><code class="sr-only" aria-hidden>lim_(x -&gt; oo) sum_(i = 0)^x 1/x in.not RR</code
        ><math class="sr-only" style="user-select: none; -webkit-user-select: none"
          ><semantics
            ><mrow
              ><msub
                ><mo form="prefix" lspace="0em" rspace="0.16666666666666666em">lim</mo
                ><mrow
                  ><mi>𝑥</mi><mo lspace="0em" rspace="0em" stretchy="false">→</mo><mi>∞</mi></mrow
                ></msub
              ><msubsup
                ><mo form="prefix" lspace="0em">∑</mo
                ><mrow><mi>𝑖</mi><mo lspace="0em" rspace="0em">=</mo><mn>0</mn></mrow
                ><mi>𝑥</mi></msubsup
              ><mfrac><mn>1</mn><mi>𝑥</mi></mfrac
              ><mo>∉</mo><mi>ℝ</mi></mrow
            ><annotation encoding="text/vnd.typst"
              >lim_(x -&gt; oo) sum_(i = 0)^x 1/x in.not RR</annotation
            ></semantics
          ></math
        ><svg><!-- snip --></svg></span>
    </p>
    "
  `)
})

test('will not render math-looking HTML that are not the exact required structure', async () => {
  const source = `
    <!-- display math without <pre> -->
    <code class="language-math math-display">x</code>

    <!-- display math with only <pre> -->
    <pre class="language-math math-display">x</pre>

    <!-- display math but <pre> has more than one children -->
    <pre>a<code class="language-math math-display">x</code></pre>

    <!-- display math but <pre>'s child is not <code> -->
    <pre><span class="language-math math-display">x</code></pre>

    <!-- display math but <pre>'s child has the wrong classes ->
    <pre><code class="language-math">x</code></pre>

    <!-- inline math but the element is not <code> -->
    <span class="language-math math-inline">x</span>

    <!-- inline math but <code> has the wrong classes -->
    <code class="language-math">x</code>

    <!-- inline math but <code>'s child is not text -->
    <code class="language-math math-inline"><em>x</em></code>

    <!-- inline math but <code> has more than one children -->
    <code class="language-math math-inline">x<em>y</em></code>

    <!-- correct inline math -->
    <code class="language-math math-inline">x</code>
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<!-- display math without <pre> -->
    <p><code class="language-math math-display">x</code></p>
    <!-- display math with only <pre> -->
    <pre class="language-math math-display">x</pre>
    <!-- display math but <pre> has more than one children -->
    <pre>a<code class="language-math math-display">x</code></pre>
    <!-- display math but <pre>'s child is not <code> -->
    <pre><span class="language-math math-display">x</span></pre>
    <!-- display math but <pre>'s child has the wrong classes ->
    <pre><code class="language-math">x</code></pre>

    <!-- inline math but the element is not <code> -->
    <p><span class="language-math math-inline">x</span></p>
    <!-- inline math but <code> has the wrong classes -->
    <p><code class="language-math">x</code></p>
    <!-- inline math but <code>'s child is not text -->
    <p>
      <code class="language-math math-inline"><em>x</em></code>
    </p>
    <!-- inline math but <code> has more than one children -->
    <p>
      <code class="language-math math-inline">x<em>y</em></code>
    </p>
    <!-- correct inline math -->
    <p>
      <span class="typst typst-inline" style="position: relative; display: inline-block"
        ><code class="sr-only" aria-hidden>x</code
        ><math class="sr-only" style="user-select: none; -webkit-user-select: none"
          ><semantics><mi>𝑥</mi><annotation encoding="text/vnd.typst">x</annotation></semantics></math
        ><svg><!-- snip --></svg></span>
    </p>
    "
  `)
})

test('works with mdx', async () => {
  const source = `That right triangles satisfy $x^2 + y^2 = z^2$ has been known since antiquity.`
  expect(await renderx(source)).toMatchInlineSnapshot(`
    "<p>
      That right triangles satisfy
      <span class="typst typst-inline" style="position: relative; display: inline-block"
        ><code class="sr-only" aria-hidden>x^2 + y^2 = z^2</code
        ><math class="sr-only" style="user-select: none; webkit-user-select: none"
          ><semantics
            ><mrow
              ><msup><mi>𝑥</mi><mn>2</mn></msup
              ><mo>+</mo><msup><mi>𝑦</mi><mn>2</mn></msup
              ><mo>=</mo><msup><mi>𝑧</mi><mn>2</mn></msup></mrow
            ><annotation encoding="text/vnd.typst">x^2 + y^2 = z^2</annotation></semantics
          ></math
        ><svg><!-- snip --></svg></span>
      has been known since antiquity.
    </p>
    "
  `)
})
