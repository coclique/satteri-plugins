import dedent from 'dedent'

/** @type {Partial<import('typedoc').TypeDocOptions>} */
export default {
  name: "daylily's Sätteri plugins",
  entryPoints: ['packages/satteri-*'],
  entryPointStrategy: 'packages',
  packageOptions: {
    entryPoints: ['src/index.ts'],
  },
  highlightLanguages: ['ts', 'js', 'tsx', 'jsx', 'md', 'markdown', 'html', 'css'],
  out: './typedoc/satteri-plugins',
  customCss: './docs/typedoc.css',
  darkHighlightTheme: 'everforest-dark',
  lightHighlightTheme: 'everforest-light',
  navigationLinks: {
    Sätteri: 'https://satteri.bruits.org',
    GitHub: 'https://github.com/coclique/satteri-plugins',
  },
  hideGenerator: true,
  customFooterHtml: dedent`
    <span style="flex: 1">
      Generated using
      <a href="https://typedoc.org/">TypeDoc</a>
    </span>
    <span>
      2026– &copy; <a href="https://dayli.ly">daylily</a> ·
      distributed under <a href="https://github.com/coclique/satteri-plugins/blob/master/LICENSE">BSD-3-Clause</a>
    </span>
  `,
  customFooterHtmlDisableWrapper: true,
  headings: false,
}
