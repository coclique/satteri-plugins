import { mdRenderer, mdxRenderer, type Options } from 'test-utils'
import { expect, test } from 'vitest'
import linkRuby from '.'

const opts: Options = { mdastPlugins: [linkRuby()], features: { directive: true } }
const render = mdRenderer(opts)
const renderx = mdxRenderer(opts)

test('turns links with a URL starting with "=" into ruby', async () => {
  const source = `[君子](=くんし)は[和](=わ)して[同](=どう)せず`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby>君子<rp>(</rp><rt>くんし</rt><rp>)</rp></ruby>は<ruby
        >和<rp>(</rp><rt>わ</rt><rp>)</rp></ruby
      >して<ruby>同<rp>(</rp><rt>どう</rt><rp>)</rp></ruby>せず
    </p>
    "
  `)
})

test('leaves normal links alone', async () => {
  const source = `Navigate to [this website](https://example.com)`

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>Navigate to <a href="https://example.com">this website</a></p>
    "
  `)
})

test('works with mdx', async () => {
  const source = `[君子](=くんし)は[和](=わ)して[同](=どう)せず`

  expect(await renderx(source)).toMatchInlineSnapshot(`
    "<p>
      <ruby>君子<rp>(</rp><rt>くんし</rt><rp>)</rp></ruby>は<ruby
        >和<rp>(</rp><rt>わ</rt><rp>)</rp></ruby
      >して<ruby>同<rp>(</rp><rt>どう</rt><rp>)</rp></ruby>せず
    </p>
    "
  `)
})
