import { defineMdastPlugin } from 'satteri'
import { mdRenderer, mdxRenderer, type Options } from 'test-utils'
import { expect, test } from 'vitest'
import directiveRuby from '.'

const opts: Options = {
  mdastPlugins: [
    directiveRuby(),
    defineMdastPlugin({
      name: 'fallback',
      textDirective(node) {
        return { ...node, data: { hName: node.name, hProperties: node.attributes ?? {} } }
      },
    }),
  ],
  features: { directive: true },
}

const render = mdRenderer(opts)
const renderx = mdxRenderer(opts)

test('simple ruby directives', async () => {
  const source = `:ruby[茅場町(かやばちょう)]`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby>茅場町<rp>(</rp><rt>かやばちょう</rt><rp>)</rp></ruby>
    </p>
    "
  `)
})

test('compound ruby directives', async () => {
  const source = `:ruby[君子(くんし)は/和(わ)して/同(どう)せず]`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby>君子<rp>(</rp><rt>くんし</rt><rp>)</rp></ruby>は<ruby
        >和<rp>(</rp><rt>わ</rt><rp>)</rp></ruby
      >して<ruby>同<rp>(</rp><rt>どう</rt><rp>)</rp></ruby>せず
    </p>
    "
  `)
})

test('markdown syntax can appear at the base', async () => {
  const source = `:ruby[**人**(ひと)に/**诲**(おし)えて/**倦**(う)まず]`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby><strong>人</strong><rp>(</rp><rt>ひと</rt><rp>)</rp></ruby>に<ruby
        ><strong>诲</strong><rp>(</rp><rt>おし</rt><rp>)</rp></ruby
      >えて<ruby><strong>倦</strong><rp>(</rp><rt>う</rt><rp>)</rp></ruby>まず
    </p>
    "
  `)
})

test('markdown syntax can appear at the annotation', async () => {
  const source = `
    :ruby[編集者([editor](https://en.wikipedia.org/wiki/Editing))と/利用許諾([license](https://en.wikipedia.org/wiki/License))を]
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby
        >編集者<rp>(</rp><rt><a href="https://en.wikipedia.org/wiki/Editing">editor</a></rt
        ><rp>)</rp></ruby
      >と<ruby
        >利用許諾<rp>(</rp><rt><a href="https://en.wikipedia.org/wiki/License">license</a></rt
        ><rp>)</rp></ruby
      >を
    </p>
    "
  `)
})

test('can escape characters with special meaning with ampersand', async () => {
  const source = `:ruby[常用&&当用漢字表&(じょうよう&/とうようかんじひょう&)]`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>常用&amp;当用漢字表(じょうよう/とうようかんじひょう)</p>
    "
  `)
})

test('leaves other directives alone', async () => {
  const source = `:foo[bar]`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p><foo>bar</foo></p>
    "
  `)
})

test('works with mdx', async () => {
  const source = `:ruby[君子(くんし)は/和(わ)して/同(どう)せず]`
  expect(await renderx(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby>君子<rp>(</rp><rt>くんし</rt><rp>)</rp></ruby>は<ruby
        >和<rp>(</rp><rt>わ</rt><rp>)</rp></ruby
      >して<ruby>同<rp>(</rp><rt>どう</rt><rp>)</rp></ruby>せず
    </p>
    "
  `)
})

test('attributes are attached to all ruby elements', async () => {
  const source = `:ruby[君子(くんし)は/和(わ)して/同(どう)せず]{.class #id data-key=value}`
  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby class="class" id="id" data-key="value">君子<rp>(</rp><rt>くんし</rt><rp>)</rp></ruby>は<ruby
        class="class"
        id="id"
        data-key="value"
        >和<rp>(</rp><rt>わ</rt><rp>)</rp></ruby
      >して<ruby class="class" id="id" data-key="value">同<rp>(</rp><rt>どう</rt><rp>)</rp></ruby>せず
    </p>
    "
  `)
})
