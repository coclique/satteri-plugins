import * as JSX from '@kitajs/html/jsx-runtime'
import dedent from 'dedent'
import { format } from 'prettier'
import {
  evaluate,
  markdownToHtml,
  mdxToJs,
  type CompileOptions,
  type EvaluateOptions,
} from 'satteri'

export interface Options extends CompileOptions {
  then?: (html: string) => string
}

export function mdRenderer(opts: Options) {
  return async (md: string) => {
    const result = await markdownToHtml(dedent(md), opts)
    const formatted = await format(result.html, { parser: 'html', printWidth: 100 })
    return opts.then?.(formatted) ?? formatted
  }
}

export function mdxRenderer(opts: Options) {
  return async (mdx: string) => {
    const result = (await evaluate(dedent(mdx), {
      ...(JSX as Pick<EvaluateOptions, 'Fragment' | 'jsx' | 'jsxs'>),
      ...opts,
    })) as { default: () => string }
    const formatted = await format(result.default(), { parser: 'html', printWidth: 100 })
    return opts.then?.(formatted) ?? formatted
  }
}

export function mdxTranspiler(opts: Options) {
  return async (mdx: string, { full = false } = {}) => {
    const result = await mdxToJs(dedent(mdx), {
      jsx: true,
      outputFormat: 'function-body',
      elementAttributeNameCase: 'html',
      ...opts,
    })

    let code = result.code
    try {
      code = await format(result.code, { parser: 'babel' })
    } catch {}

    if (!full) {
      code = dedent(
        code
          .split('function MDXContent')[0]
          .split('/*@jsxImportSource react*/')[1]
          .replaceAll('_components.', '')
          .split('return ')[1]
          .split(/\;\s*\}/gm)
          .slice(0, -1)
          .join(';}'),
      )
    }

    return code
  }
}
