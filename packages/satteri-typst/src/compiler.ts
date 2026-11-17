import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler'

function singleton<T>(f: () => T): () => T {
  let store: T | null = null
  return () => {
    if (store === null) {
      store = f()
    }
    return store
  }
}

const compiler: () => NodeCompiler = singleton(() => NodeCompiler.create())
export default compiler
