import { fileURLToPath } from 'node:url'
import got from 'got'
import path from 'path'
import fs from 'fs-extra'
import ora from 'ora'

import type { CDNToolNS } from './types'

/**
 * 命令行参数
 * OSS_KEY: 对应OSS accessKeyId
 * OSS_SECRET: 对应OSS accessKeySecret
 * OSS_SECRET: 对应OSS accessKeySecret
 */
// const client = new OSS({
//   region: 'oss-cn-hangzhou',
//   accessKeyId: argv.OSS_KEY,
//   accessKeySecret: argv.OSS_SECRET,
//   bucket: 'beicai-dev',
// })

const cdnModules = [
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

const __dirname = fileURLToPath(import.meta.url)
const QueueStep = 100
const DownloadOrigin = 'https://cdn.jsdelivr.net/npm/'
const TempRoot = path.join(__dirname, '../../\.temp')
const spinner = ora('download...')

async function downloadFileFormExternal(modules) {
  spinner.start()
  for (let i = 0; i < modules.length; i++) {
    const module = modules[i]
    spinner.text = `download ${module.name}@${module.version}`
    spinner.text = `download [${i + 1}/${modules.length}] ${module.name}@${module.version}`
    const pkgInfo: CDNToolNS.PkgInfo = await got(
      getPackageApi(`${module.name}@${module.version}`),
      {
        searchParams: {
          structure: 'flat',
        },
      },
    ).json()
    const { files } = pkgInfo
    for (let y = 0; y < files.length; y += QueueStep) {
      const currentFiles = files.slice(y, y + QueueStep)
      await Promise.all(
        currentFiles.map((file) => {
          const filePath = path.join(`${pkgInfo.name}@${pkgInfo.version}`, file.name)
          const tempFilePath = path.join(TempRoot, filePath)
          return got(getFileDownloadUrl(filePath))
            .buffer()
            .then(buffer => {
              spinner.text = `download [${i + 1}/${modules.length}] ${filePath}`
              fs.ensureFileSync(tempFilePath)
              fs.writeFileSync(tempFilePath, buffer)
            }).catch((err) => {
              console.log(err, filePath)
            })
        }),
      )
    }
  }
  spinner.stop()
}

function getFileDownloadUrl(filePath: string) {
  return path.join(DownloadOrigin, filePath)
}

function getPackageApi(packageName) {
  return `https://data-jsdelivr-com-preview.onrender.com/v1/packages/npm/${packageName}`
}

async function main() {
  downloadFileFormExternal(cdnModules)
}

main()
