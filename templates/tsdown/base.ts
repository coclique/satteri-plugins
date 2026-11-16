import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  unbundle: true,
  platform: 'neutral',
  publint: true,
  attw: true,
})
