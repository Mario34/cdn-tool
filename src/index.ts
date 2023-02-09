import got from 'got'
import path from 'path'
import ora from 'ora'

import type { CDNToolNS } from './types'

const spinner = ora('download...')

const defaultOption: GetPkgsFileOption = {
  pkgList: [],
  downloadOrigin: 'https://cdn.jsdelivr.net/npm/',
  queueStep: 100,
  fileReady: () => Promise.resolve(),
  getPkgInfo: getPackageApi,
}

export interface GetPkgsFileOption {
  pkgList: CDNToolNS.PkgConfig[]
  downloadOrigin?: string
  queueStep?: number
  fileReady?: (fileBuffer: Buffer, filePath: string) => Promise<void>
  getPkgInfo?: (pkgConfig: CDNToolNS.PkgConfig) => string
}

function getPackageApi({ name, version }: CDNToolNS.PkgConfig) {
  return `https://data-jsdelivr-com-preview.onrender.com/v1/packages/npm/${`${name}@${version}`}`
}

export async function getPkgFile(option: GetPkgsFileOption) {
  const {
    pkgList, fileReady, downloadOrigin, queueStep,
  } = Object.assign(defaultOption, option)
  spinner.start()
  for (let i = 0; i < pkgList.length; i++) {
    const pkgConfig = pkgList[i]
    spinner.text = `download ${pkgConfig.name}@${pkgConfig.version}`
    spinner.text = `download [${i + 1}/${pkgList.length}] ${pkgConfig.name}@${pkgConfig.version}`
    const pkgInfo: CDNToolNS.PkgInfo = await got(
      getPackageApi(pkgConfig),
      {
        searchParams: {
          structure: 'flat',
        },
      },
    ).json()
    const { files } = pkgInfo
    for (let y = 0; y < files.length; y += queueStep) {
      const currentFiles = files.slice(y, y + queueStep)
      await Promise.all(
        currentFiles.map(async (file) => {
          const filePath = path.join(`${pkgInfo.name}@${pkgInfo.version}`, file.name)
          const fileBuffer = await got(path.join(downloadOrigin, filePath)).buffer()
          spinner.text = `download [${i + 1}/${pkgList.length}] ${filePath}`
          await fileReady(fileBuffer, filePath)
        }),
      )
    }
  }
  spinner.stop()
}
