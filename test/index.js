import { getPkgFile } from '../lib/index.js'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'

const pkgList = [
  {
    name: '@mario34/mp-ci',
    version: '1.2.2',
  },
  {
    name: 'vue',
    version: '3.2.45',
  },
  {
    name: 'vue-router',
    version: '4.1.6',
  },
]

getPkgFile({
  pkgList,
  async fileReady(fileBuffer, filePath) {
    const tempFilePath = path.join(fileURLToPath(new URL('.', import.meta.url)), '../.temp', filePath)
    await fs.ensureFile(tempFilePath)
    await fs.writeFile(tempFilePath, fileBuffer)
  },
})
