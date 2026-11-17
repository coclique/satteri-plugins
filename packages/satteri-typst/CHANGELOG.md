# satteri-typst

## 0.2.0

### Minor Changes

- [`8b30d3e`](https://github.com/coclique/satteri-plugins/commit/8b30d3eae8d72fa62fa76d835d11f0b170ab8c7b)  *([@coclique](https://github.com/coclique))*  
Attempt to recolor SVG output into `currentColor` by default

- [`8b30d3e`](https://github.com/coclique/satteri-plugins/commit/8b30d3eae8d72fa62fa76d835d11f0b170ab8c7b)  *([@coclique](https://github.com/coclique))*  
Output a `<div>` wrapper element for display math instead of `<span>`

- [`8b30d3e`](https://github.com/coclique/satteri-plugins/commit/8b30d3eae8d72fa62fa76d835d11f0b170ab8c7b)  *([@coclique](https://github.com/coclique))*  
Add options to configure the color and scale of the SVG output

### Patch Changes

- [`8b30d3e`](https://github.com/coclique/satteri-plugins/commit/8b30d3eae8d72fa62fa76d835d11f0b170ab8c7b)  *([@coclique](https://github.com/coclique))*  
Remove inline styling from the wrapper element of each math equation. This shouldn't have a visual effect.

- [`8b30d3e`](https://github.com/coclique/satteri-plugins/commit/8b30d3eae8d72fa62fa76d835d11f0b170ab8c7b)  *([@coclique](https://github.com/coclique))*  
Strip Typst-generated CSS from the output (they are only intended for interactive use cases like typst.app and Tinymist). This shouldn't have a visual effect.

## 0.1.0

### Minor Changes

- Initial release
