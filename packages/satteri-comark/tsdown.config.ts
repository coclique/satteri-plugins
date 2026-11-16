import { defineConfig } from 'tsdown'
import base from '../../templates/tsdown/base.ts'

export default defineConfig({ ...base, entry: ['src/index.ts', 'src/2colons.ts'] })
