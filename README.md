# daylily's Sätteri plugins

A collection of [Sätteri](https://satteri.bruits.org) plugins that are hopefully useful.

<p align="center">[
<a href="#satteri-comark"><b>comark</b></a> ·
<a href="#satteri-custom-protocols"><b>custom-protocols</b></a> ·
<a href="#satteri-directive-ruby"><b>directive-ruby</b></a> ·
<a href="#satteri-extended-table"><b>extended-table</b></a> ·
<a href="#satteri-link-ruby"><b>link-ruby</b></a> ·
<a href="#satteri-typst"><b>typst</b></a>
]</p>

The list below only provides an overview of the plugins in this repository. Follow the "**Docs**" link under each package to learn more about its usage.

## satteri-comark

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-comark) · [**npm**](https://www.npmjs.com/package/satteri-comark)

Provides support for most of [Comark](https://comark.dev)'s syntax by transforming them into MDX. This is also useful if you just want to translate Markdown directives into MDX elements.

### Example input

````markdown
::card{title="Hello" variant="primary"}
  :::badge{:color="frontmatter.variant" :text="frontmatter.title"}
  :::
::
````

### Example output

```jsx
<Card title="Hello" variant="primary">
  <Badge color={frontmatter.variant} text={frontmatter.title} />
</Card>
```
<sup>(MDX only.)</sup>

## satteri-custom-protocols

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-custom-protocols) · [**npm**](https://www.npmjs.com/package/satteri-custom-protocols)

Rewrites URLs with custom protocols into regular resolvable ones.

### Example input

```markdown
- [Wikipedia:Artificial Intelligence](wp:Artificial_Intelligence)
- [RFC 9110](rfc:9110)
```

### Example output

> - [Wikipedia:Artificial Intelligence](https://en.wikipedia.org/wiki/Artificial_Intelligence)
> - [RFC 9110](https://tools.ietf.org/html/rfc9110)

```markdown
- [Wikipedia:Artificial Intelligence](https://en.wikipedia.org/wiki/Artificial_Intelligence)
- [RFC 9110](https://tools.ietf.org/html/rfc9110)
```

## satteri-directive-ruby

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-directive-ruby) · [**npm**](https://www.npmjs.com/package/satteri-directive-ruby)

Provides the `:ruby[base(annotation)]` directive for adding ruby annotations to text. The syntax provided here is an extension of that of [`remark-ruby-directive`](https://github.com/brklntmhwk/remark-ruby-directive).

### Example input

```markdown
:ruby[君子(くんし)は/和(わ)して/同(どう)せず]
```

### Example output

> <ruby>君子<rt>くんし</rt></ruby>は<ruby>和<rt>わ</rt></ruby>して<ruby>同<rt>どう</rt></ruby>せず

```markdown
<ruby>君子<rt>くんし</rt></ruby>は
<ruby>和<rt>わ</rt></ruby>して
<ruby>同<rt>どう</rt></ruby>せず
```
<sup>(Newlines only for demonstration purposes.)</sup>

## satteri-extended-table

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-extended-table) · [**npm**](https://www.npmjs.com/package/satteri-extended-table)

Allows you to write Markdown tables with colspans and rowspans. A cell containing only `^` is merged with the cell above, and a cell containing only `>` is merged with the cell to the right. This is more or less the syntax of [`remark-extended-table`](https://github.com/wataru-chocola/remark-extended-table) with very minor differences in edge cases.

### Example input

```markdown
| a | b | c | d |
|---|---|---|---|
| 1 | > | 3 | 4 |
| ^ |   | ^ | 8 |
| 9 | > | A | B |
```

### Example output

<blockquote>
  <table>
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
</blockquote>

```html
<table>
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
```

## satteri-link-ruby

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-link-ruby) · [**npm**](https://www.npmjs.com/package/satteri-link-ruby)

A more lightweight ruby syntax piggybacking the Markdown link syntax. A link of the form `[text](=annotation)` will be converted to a ruby annotation.

### Example input

```markdown
[人](=ひと)は[死](=し)して[名](=な)を[残](=のこ)す
```

### Example output

> <ruby>人<rt>ひと</rt></ruby>は<ruby>死<rt>し</rt></ruby>して<ruby>名<rt>な</rt></ruby>を<ruby>残<rt>のこ</rt></ruby>す

```html
<ruby>人<rt>ひと</rt></ruby>は
<ruby>死<rt>し</rt></ruby>して
<ruby>名<rt>な</rt></ruby>を
<ruby>残<rt>のこ</rt></ruby>す
```
<sup>(Newlines only for demonstration purposes.)</sup>

## satteri-typst

> [**Docs**](https://dayli.ly/satteri-plugins/modules/satteri-typst) · [**npm**](https://www.npmjs.com/package/satteri-typst)

Renders inline and display math through [Typst](https://typst.app/home). Enough said.

### Example input

```markdown
The dependently-typed *eliminator* of the natural number type is

$$
"elim"_NN : product_(P : NN -> cal(U)) P(0) -> (product_(n : NN) P(n) -> P(n^+)) -> product_(n : NN) P(n).
$$
```

### Example output

> The dependently-typed *eliminator* of the natural number type is
>
> $$
> {\rm elim}_\mathbb N : \prod_{P : \mathbb N \to \cal U} P(0) \to (\prod_{n : \mathbb N} P(n) \to P(n^+)) \to \prod_{n : \mathbb N} P(n).
> $$

-----

*This software is disseminated under the permissive [3-Clause BSD License (`BSD-3-Clause`)](LICENSE).*
