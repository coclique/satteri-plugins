import { mdRenderer, mdxRenderer, type Options } from 'test-utils'
import { expect, test } from 'vitest'
import customProtocols from '.'

const opts: Options = {
  mdastPlugins: [
    customProtocols({
      protocols: {
        wp: `https://en.wikipedia.org/wiki/%s`,
        rfc(id) {
          if (id.startsWith('std') || id.startsWith('bcp'))
            return `https://tools.ietf.org/html/${id}`
          else return `https://tools.ietf.org/html/rfc${id}`
        },
      },
    }),
  ],
}

const render = mdRenderer(opts)
const renderx = mdxRenderer(opts)

test('string-based protocol handler', async () => {
  const source = `[Artificial intelligence](wp:Artificial_intelligence)`
  expect(await render(source)).toMatchInlineSnapshot(`
    "<p><a href="https://en.wikipedia.org/wiki/Artificial_intelligence">Artificial intelligence</a></p>
    "
  `)
})

test('function-based protocol handler', async () => {
  const source = `
    [RFC 9110](rfc:9110) is part of [STD 97](rfc:std97), and [RFC 5646](rfc:5646) is part of
    [BCP 47](rfc:bcp47).
  `
  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <a href="https://tools.ietf.org/html/rfc9110">RFC 9110</a> is part of
      <a href="https://tools.ietf.org/html/std97">STD 97</a>, and
      <a href="https://tools.ietf.org/html/rfc5646">RFC 5646</a> is part of
      <a href="https://tools.ietf.org/html/bcp47">BCP 47</a>.
    </p>
    "
  `)
})

test('normalizes non-url-safe characters', async () => {
  const source = `
    A coati is sometimes incorrectly referred to as a
    ["Brazilian aardvark"](<wp:Brazilian aardvark>).
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      A coati is sometimes incorrectly referred to as a
      <a href="https://en.wikipedia.org/wiki/Brazilian%20aardvark">"Brazilian aardvark"</a>.
    </p>
    "
  `)
})

test('leaves unspecified protocols alone', async () => {
  const source = `
    [IPFS link](ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/wiki/Vincent_van_Gogh.html)
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      <a
        href="ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/wiki/Vincent_van_Gogh.html"
        >IPFS link</a
      >
    </p>
    "
  `)
})

test('also transforms link definitions', async () => {
  const source = `
    Religious philosopher Nikolai Berdyaev once supported a claim in his book by writing "this was
    once [revealed to me in a dream][revelation].

    [revelation]: <wp:Revelation>
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<p>
      Religious philosopher Nikolai Berdyaev once supported a claim in his book by writing "this was
      once <a href="https://en.wikipedia.org/wiki/Revelation">revealed to me in a dream</a>.
    </p>
    "
  `)
})

test('works with mdx', async () => {
  const source = `
    [Artificial intelligence](wp:Artificial_intelligence)
  `
  expect(await renderx(source)).toMatchInlineSnapshot(`
    "<p><a href="https://en.wikipedia.org/wiki/Artificial_intelligence">Artificial intelligence</a></p>
    "
  `)
})
