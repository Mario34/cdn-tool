import got from 'got'
import ora from 'ora'

import type { CDNToolNS } from './types'

const spinner = ora('download...')

const defaultOption: GetPkgsFileOption = {
  pkgList: [],
  fileReady: () => Promise.resolve(),
  getPkgUrl,
  queueStep: 100,
}

export interface GetPkgsFileOption {
  pkgList: CDNToolNS.PkgConfig[]
  fileReady?: (fileBuffer: Buffer, pkg: CDNToolNS.PkgConfig) => Promise<void>
  getPkgUrl?: (pkgConfig: CDNToolNS.PkgConfig) => string
  queueStep?: number
}

function getPkgUrl({ name, version }: CDNToolNS.PkgConfig) {
  const [,name_] = name.split('/')
  return `https://registry.npmmirror.com/${name}/-/${name_ || name}-${version}.tgz`
}

export async function getPkgFile(option: GetPkgsFileOption) {
  const {
    pkgList,
    fileReady,
    getPkgUrl,
    queueStep,
  } = Object.assign(defaultOption, option)
  spinner.start()
  for (let i = 0; i < pkgList.length; i += queueStep) {
    const currentFiles = pkgList.slice(i, i + queueStep)
    await Promise.all(
      currentFiles.map(async (pkgConfig) => {
        const tgzUrl = getPkgUrl(pkgConfig)
        spinner.text = `download [${i + 1}/${pkgList.length}] ${pkgConfig.name}@${pkgConfig.version} ${tgzUrl}\n`
        const fileBuffer = await got(tgzUrl).buffer()
        await fileReady(fileBuffer, pkgConfig)
      }),
    )
  }
  spinner.stop()
}
