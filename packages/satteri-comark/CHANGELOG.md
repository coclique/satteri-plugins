# satteri-comark

## 0.4.0

### Minor Changes

- [`3b0f905`](https://github.com/coclique/satteri-plugins/commit/3b0f90586c5695e03d2629b78ec94cefbf3c65bc)  *([@coclique](https://github.com/coclique))*  
Improve warning messages; they now include position in the source (if available) and try not to span multiple lines.

## 0.3.0

### Minor Changes

- Improve documentation and typing

## 0.2.0 (2026-09-14)

- Allow disabling props blocks and slots parsing in the `Options` to `comark-mdx`
- Allow customizing output for labels separate from slots in the `Options` to `comark-mdx`
- If a props block is an array at the top level, we now produce a warning and discard it instead of silently emitting broken output
- Fix failing to parse multiple named slots within the same paragraph

## 0.1.1 (2026-09-12)

- Add missing `LICENSE` file

## 0.1.0 (2026-09-12)

Initial release
