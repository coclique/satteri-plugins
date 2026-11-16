import { mdRenderer, mdxRenderer, type Options } from 'test-utils'
import { expect, test, vi } from 'vitest'
import extendedTable from '.'

const opts: Options = { mdastPlugins: [extendedTable()], features: { directive: true } }
const render = mdRenderer(opts)
const renderx = mdxRenderer(opts)

test('normal tables still work', async () => {
  const source = `
    | a | b | c |
    |:--|:-:|--:|
    | 1 | 2 | 3 |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th style="text-align: left">a</th>
          <th style="text-align: center">b</th>
          <th style="text-align: right">c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: left">1</td>
          <td style="text-align: center">2</td>
          <td style="text-align: right">3</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('horizontal merging (colspan)', async () => {
  const source = `
    | a | b | c |
    |---|---|---|
    | 1 | 2 | 3 |
    | 4 | > | 6 |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
        </tr>
        <tr>
          <td>4</td>
          <td colspan="2">6</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('vertical merging (rowspan)', async () => {
  const source = `
    | a | b | c |
    |---|---|---|
    | 1 | 2 | 3 |
    | 4 | ^ | 6 |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td rowspan="2">2</td>
          <td>3</td>
        </tr>
        <tr>
          <td>4</td>
          <td>6</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('does not merge when an adjacent cell is anything other than a merge indicator', async () => {
  const source = `
    | a       | b |
    |---------|---|
    | 1       | 2 |
    |         | 4 |
    | *>*     | 6 |
    | :raw[>] | 8 |
    | 9          ||
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>2</td>
        </tr>
        <tr>
          <td></td>
          <td>4</td>
        </tr>
        <tr>
          <td><em>&gt;</em></td>
          <td>6</td>
        </tr>
        <tr>
          <td>&gt;</td>
          <td>8</td>
        </tr>
        <tr>
          <td>9</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('two-dimensional merging (colspan and rowspan)', async () => {
  const source = `
    | a | b | c | d |
    |---|---|---|---|
    | 1 | 2 | 3 | 4 |
    | 5 | > | 7 | 8 |
    | 9 |   | ^ | 12|
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
          <th>d</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
          <td>4</td>
        </tr>
        <tr>
          <td>5</td>
          <td rowspan="2" colspan="2">7</td>
          <td>8</td>
        </tr>
        <tr>
          <td>9</td>
          <td>12</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('warns when merged cells have content', async () => {
  const consoleWarn = vi.spyOn(console, 'warn')

  const source = `
    | a | b        | c |
    |---|----------|---|
    | > | >        | 3 |
    | 4 | *5*five  | ^ |
    |   | **8**    | ^ |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="3" colspan="3">3</td>
        </tr>
        <tr></tr>
        <tr></tr>
      </tbody>
    </table>
    "
  `)

  expect(consoleWarn.mock.calls.map(call => call.join(' '))).toMatchInlineSnapshot(`
    [
      "/unknown: [satteri-extended-table] Cell has content but is skipped: *5*
    five
    ",
      "/unknown: [satteri-extended-table] Cell has content but is skipped: 4
    ",
      "/unknown: [satteri-extended-table] Cell has content but is skipped: **8**
    ",
    ]
  `)
})

test('when overlap happens, top-rightmost cell wins', async () => {
  const source = `
    | a | b | c |
    |---|---|---|
    | 1 | > | 3 |
    | > | 5 | ^ |
    |   | ^ | 9 |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td rowspan="2" colspan="2">3</td>
        </tr>
        <tr>
          <td>&gt;</td>
        </tr>
        <tr>
          <td></td>
          <td>^</td>
          <td>9</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('multiple merged cells in one table', async () => {
  const source = `
    | a | b | c | d |
    |---|---|---|---|
    | 1 | > | 3 | 4 |
    | ^ | ^ | ^ | 8 |
    | 9 | > | A | B |
  `

  expect(await render(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
          <th>d</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2">1</td>
          <td rowspan="2" colspan="2">3</td>
          <td>4</td>
        </tr>
        <tr>
          <td>8</td>
        </tr>
        <tr>
          <td>9</td>
          <td colspan="2">A</td>
          <td>B</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})

test('works with mdx', async () => {
  const source = `
    | a | b | c |
    |---|---|---|
    | 1 | > | 3 |
    | > | 5 | ^ |
    |   | ^ | 9 |
  `

  expect(await renderx(source)).toMatchInlineSnapshot(`
    "<table>
      <thead>
        <tr>
          <th>a</th>
          <th>b</th>
          <th>c</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td rowspan="2" colspan="2">3</td>
        </tr>
        <tr>
          <td>></td>
        </tr>
        <tr>
          <td></td>
          <td>^</td>
          <td>9</td>
        </tr>
      </tbody>
    </table>
    "
  `)
})
